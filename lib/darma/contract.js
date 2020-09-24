/*
    This file is part of darma.js.

    darma.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    darma.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with darma.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file contract.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @date 2014
 */

var fs = require('fs')
var utils = require('../utils/utils');
var coder = require('../types/coder');
var Event = require('./event');
var Func = require('./function');
var AllEvents = require('./allevents');
var sha3 = require('../utils/sha3');

/**
 * Should be called to encode constructor params
 *
 * @method encodeConstructorParams
 * @param {Array} abi
 * @param {Array} constructor params
 */
var encodeConstructorParams = function (abi, params) {
    return abi.filter(function (json) {
        return json.type === 'constructor' && json.inputs.length === params.length;
    }).map(function (json) {
        return json.inputs.map(function (input) {
            return input.type;
        });
    }).map(function (types) {
        return coder.encodeParams(types, params);
    })[0] || '';
};

/**
 * Should be called to add functions to contract object
 *
 * @method addFunctionsToContract
 * @param {Contract} contract
 * @param {Array} abi
 */
var addFunctionsToContract = function (contract) {
    contract.abi.filter(function (json) {
        return json.type === 'function';
    }).map(function (json) {
        return new Func(contract._core, json, contract.address);
    }).forEach(function (f) {
        f.attachToContract(contract);
    });
};

/**
 * Should be called to add events to contract object
 *
 * @method addEventsToContract
 * @param {Contract} contract
 * @param {Array} abi
 */
var addEventsToContract = function (contract) {
    var events = contract.abi.filter(function (json) {
        return json.type === 'event';
    });

    var All = new AllEvents(contract._core._requestManager, events, contract.address);
    All.attachToContract(contract);

    events.map(function (json) {
        return new Event(contract._core._requestManager, json, contract.address);
    }).forEach(function (e) {
        e.attachToContract(contract);
    });
};


/**
 * Should be called to check if the contract gets properly deployed on the blockchain.
 *
 * @method checkForContractAddress
 * @param {Object} contract
 * @param {Func} callback
 * @returns {Undefined}
 */
var checkForContractAddress = function(contract, callback){
    var count = 0,
        callbackFired = false,
        height = 0;

    // wait for receipt
    var filter = contract._core.filter('latest', function(e, r){
        if (!e && !callbackFired) {
            if (height !== 0){
                count += r.height - height;
            }
            height = r.height;

            // stop watching after 50 blocks (timeout)
            if (count > 10) {

                filter.stopWatching(function() {});
                callbackFired = true;

                if (callback)
                    callback(new Error('Contract transaction couldn\'t be found after 10 blocks'));
                else
                    throw new Error('Contract transaction couldn\'t be found after 10 blocks');


            } else {

                contract._core.getContractAddressByTxhash({hash: contract.transactionHash}, function(e, receipt){
                    if(!e && receipt && receipt.address && !callbackFired) {

                        // todo: getCode
                        contract._core.getContractResult({tx_hash: contract.transactionHash}, function(e, code){
                            /*jshint maxcomplexity: 6 */

                            if(callbackFired || !code)
                                return;

                            filter.stopWatching(function() {});
                            callbackFired = true;

                            if(code.data.length > 3) {

                                console.log('Contract code deployed!');

                                contract.address = receipt.address;

                                // attach events and methods again after we have
                                addFunctionsToContract(contract);
                                addEventsToContract(contract);

                                // call callback for the second time
                                if(callback)
                                    callback(null, contract);

                            } else {
                                if(callback)
                                    callback(new Error('The contract code couldn\'t be stored, please check your gas amount.'));
                                else
                                    throw new Error('The contract code couldn\'t be stored, please check your gas amount.');
                            }
                        });
                    }
                });
            }
        }
    });
};

/**
 * Should be called to create new ContractFactory instance
 *
 * @method ContractFactory
 * @param {Array} abi
 */
var ContractFactory = function (core, abi) {
    this.core = core;
    this.abi = abi;
    this.code = null;

    /**
     * Should be called to create new contract on a blockchain
     *
     * @method new
     * @param {Any} contract constructor param1 (optional)
     * @param {Any} contract constructor param2 (optional)
     * @param {Object} contract transaction object (required)
     * @param {Func} callback
     * @returns {Contract} returns contract instance
     */
    this.new = function () {
        /*jshint maxcomplexity: 7 */

        var contract = new Contract(this.core, this.abi);

        // parse arguments
        var options = {}; // required!
        var callback;

        var args = Array.prototype.slice.call(arguments);
        if (utils.isFunction(args[args.length - 1])) {
            callback = args.pop();
        }

        var last = args[args.length - 1];
        if (utils.isObject(last) && !utils.isArray(last)) {
            options = args.pop();
        }

        if (options.amount > 0) {
            var constructorAbi = abi.filter(function (json) {
                return json.type === 'constructor' && json.inputs.length === args.length;
            })[0] || {};
            if (constructorAbi.name.substring(0, 1) != '$') {
                throw new Error('Cannot send value to non-payable constructor');
            }
        }

        var bytes = encodeConstructorParams(this.abi, args);
        options.data += bytes;

        if (callback) {

            // wait for the contract address and check if the code was deployed
            this.core.createContract(options, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    // add the transaction hash
                    contract.transactionHash = res.tx_hash;

                    // call callback for the first time
                    callback(null, contract);

                    checkForContractAddress(contract, callback);
                }
            });
        } else {
            var res = this.core.createContract(options);
            // add the transaction hash
            contract.transactionHash = res.tx_hash;
            checkForContractAddress(contract);
        }

        return contract;
    };

    this.new.getData = this.getData.bind(this);
};

/**
 * Should be called to create new ContractFactory
 *
 * @method contract
 * @param {Array} abi
 * @returns {ContractFactory} new contract factory
 */
//var contract = function (abi) {
    //return new ContractFactory(abi);
//};



/**
 * Should be called to get access to existing contract on a blockchain
 *
 * @method at
 * @param {Address} contract address (required)
 * @param {Func} callback {optional)
 * @returns {Contract} returns contract if no callback was passed,
 * otherwise calls callback function (err, contract)
 */
ContractFactory.prototype.at = function (address, callback) {
    var contract = new Contract(this.core, this.abi, address);

    // this functions are not part of prototype,
    // because we dont want to spoil the interface
    addFunctionsToContract(contract);
    addEventsToContract(contract);

    if (callback) {
        callback(null, contract);
    }
    return contract;
};

/**
 * Use this method to specify the code file path
 * Should be called when trying to deploy a new contract
 *
 * @method at
 * @param {String} codeFile (required)
 * @returns {ContractFactory} returns ContractFactory itself
 */
ContractFactory.prototype.codeFile = function(codeFile) {
    var code = "0x" + fs.readFileSync(codeFile).toString('hex');
    this.code = code;
    return this;
}

/**
 * Use this method to pack the code with constructor params
 * Should be called when trying to deploy a new contract
 *
 * @method at
 * @param {Array} the param list (required)
 * @returns {HexString} returns the packed data
 */
ContractFactory.prototype.packContructorData = function() {
    if(!this.code) {
        throw new Error('There is no code file specified. Please specify it with codeFile method.');
    }

    var args = Array.prototype.slice.call(arguments);
    var bytes = encodeConstructorParams(this.abi, args);
    return this.code + bytes
}

/**
 * Should be called to encode function params
 *
 * @method packFunctionData
 * @param {Array} function name
 * @param {Array} function params list
 * @return {HexString} returns the packed data
 */
ContractFactory.prototype.packFunctionData = function () {
    var args = Array.prototype.slice.call(arguments);
    if(args.length < 1) {
        throw new Error('Please specify the function name and parameters.');
    }
    var funcName = args[0];
    var params = []
    if(args.length > 1) {
        params = args[1]
    }

    if(!utils.isString(funcName)) {
        throw new Error('Invalide function name.');
    }

    if(!utils.isArray(params)) {
        throw new Error('Invalide arguments array.');
    }

    var abiJson = this.abi.filter(function (json) {
        return json.type === 'function' && json.name==funcName && json.inputs.length === params.length;
    })[0]

    if(!abiJson) {
        throw new Error('Invalide function name or arguments.');
    }

    var types = abiJson.inputs.map(function (input) {
        return input.type;
    })

    var sigName = funcName + "(" + types.toString() + ")"

    var sig = sha3(sigName).slice(0, 8);
    return '0x' + sig + coder.encodeParams(types, params);
};

ContractFactory.prototype.unPackOutput = function() {
    var args = Array.prototype.slice.call(arguments);
    if(args.length < 2) {
        throw new Error('Please specify the function name and parameters.');
    }
    var funcName = args[0];
    var output = args[1]

    if (!output) {
        return;
    }

    if(!utils.isString(funcName)) {
        throw new Error('Invalide function name.');
    }

    if(!utils.isString(output)) {
        throw new Error('Invalide output hex string.');
    }

    var abiJson = this.abi.filter(function (json) {
        return json.type === 'function' && json.name==funcName;
    })[0]

    if(!abiJson) {
        throw new Error('Invalide function name.');
    }

    var types = abiJson.outputs.map(function (output) {
        return output.type;
    })

    output = output.length >= 2 ? output.slice(2) : output;
    var result = coder.decodeParams(types, output);
    return result.length === 1 ? result[0] : result;
}

/**
 * Gets the data, which is data to deploy plus constructor params
 *
 * @method getData
 */
ContractFactory.prototype.getData = function () {
    var options = {}; // required!
    var args = Array.prototype.slice.call(arguments);

    var last = args[args.length - 1];
    if (utils.isObject(last) && !utils.isArray(last)) {
        options = args.pop();
    }

    var bytes = encodeConstructorParams(this.abi, args);
    options.data += bytes;

    return options.data;
};

/**
 * Should be called to create new contract instance
 *
 * @method Contract
 * @param {Array} abi
 * @param {Address} contract address
 */
var Contract = function (core, abi, address) {
    this._core = core;
    this.transactionHash = null;
    this.address = address;
    this.abi = abi;
};

module.exports = ContractFactory;
