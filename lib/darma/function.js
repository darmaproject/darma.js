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
 * @file function.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @date 2015
 */

var coder = require('../types/coder');
var utils = require('../utils/utils');
var errors = require('./errors');
var formatters = require('./formatters');
var sha3 = require('../utils/sha3');

/**
 * This prototype should be used to call/sendTransaction to functions
 */
var Func = function (darma, json, address) {
    this._darma = darma;
    this._inputTypes = json.inputs.map(function (i) {
        return i.type;
    });
    this._outputTypes = json.outputs.map(function (i) {
        return i.type;
    });
    this._constant = json.constant;
    if (json.name.substring(0, 1) == '$') {
        this._payable = true;
    }
    this._name = utils.transformToFullName(json);
    this._address = address;
};

Func.prototype.extractCallback = function (args) {
    if (utils.isFunction(args[args.length - 1])) {
        return args.pop(); // modify the args array!
    }
};

Func.prototype.extractDefaultBlock = function (args) {
    if (args.length > this._inputTypes.length && !utils.isObject(args[args.length -1])) {
        return formatters.inputDefaultBlockNumberFormatter(args.pop()); // modify the args array!
    }
};

/**
 * Should be called to check if the number of arguments is correct
 *
 * @method validateArgs
 * @param {Array} arguments
 * @throws {Error} if it is not
 */
Func.prototype.validateArgs = function (args) {
    var inputArgs = args.filter(function (a) {
      // filter the options object but not arguments that are arrays
      return !( (utils.isObject(a) === true) &&
                (utils.isArray(a) === false) &&
                (utils.isBigNumber(a) === false)
              );
    });
    if (inputArgs.length !== this._inputTypes.length) {
        throw errors.InvalidNumberOfArgs();
    }
};

/**
 * Should be used to create payload from arguments
 *
 * @method toPayload
 * @param {Array} function params
 * @param {Object} optional payload options
 */
Func.prototype.toPayload = function (args) {
    var options = {};
    if (args.length > this._inputTypes.length && utils.isObject(args[args.length -1])) {
        options = args[args.length - 1];
    }
    this.validateArgs(args);
    options.to = this._address;
    options.data = '0x' + this.signature() + coder.encodeParams(this._inputTypes, args);
    return options;
};

/**
 * Should be used to get function signature
 *
 * @method signature
 * @return {String} function signature
 */
Func.prototype.signature = function () {
    return sha3(this._name).slice(0, 8);
};


Func.prototype.unpackOutput = function (output) {
    if (!output) {
        return;
    }

    output = output.length >= 2 && output.slice(0, 2) === "0x" ? output.slice(2) : output;
    var result = coder.decodeParams(this._outputTypes, output);
    return result.length === 1 ? result[0] : result;
};

/**
 * Calls a contract function.
 *
 * @method call
 * @param {...Object} Contract function arguments
 * @param {function} If the last argument is a function, the contract function
 *   call will be asynchronous, and the callback will be passed the
 *   error and result.
 * @return {String} output bytes
 */
Func.prototype.call = function () {
    var args = Array.prototype.slice.call(arguments).filter(function (a) {return a !== undefined; });
    var callback = this.extractCallback(args);
    var defaultBlock = this.extractDefaultBlock(args);
    var payload = this.toPayload(args);


    if (!callback) {
        var output = this._darma.call(payload, defaultBlock);
        return this.unpackOutput(output.data);
    }

    var self = this;
    this._darma.call(payload, defaultBlock, function (error, output) {
        if (error) return callback(error, null);

        var unpacked = null;
        try {
            unpacked = self.unpackOutput(output.data);
        }
        catch (e) {
            error = e;
        }

        callback(error, unpacked);
    });
};

/**
 * Should be used to sendTransaction to function
 *
 * @method sendTransaction
 */
Func.prototype.sendTransaction = function () {
    var args = Array.prototype.slice.call(arguments).filter(function (a) {return a !== undefined; });
    var callback = this.extractCallback(args);
    var payload = this.toPayload(args);

    if (payload.value > 0 && !this._payable) {
        throw new Error('Cannot send value to non-payable function');
    }

    if (!callback) {
        return this._darma.sendContract(payload);
    }

    this._darma.sendContract(payload, callback);
};

/**
 * Should be used to estimateGas of function
 *
 * @method estimateGas
 */
Func.prototype.estimateGas = function () {
    var args = Array.prototype.slice.call(arguments);
    var callback = this.extractCallback(args);
    var payload = this.toPayload(args);

    if (!callback) {
        return this._darma.estimateGas(payload);
    }

    this._darma.estimateGas(payload, callback);
};

/**
 * Return the encoded data of the call
 *
 * @method getData
 * @return {String} the encoded data
 */
Func.prototype.getData = function () {
    var args = Array.prototype.slice.call(arguments);
    var payload = this.toPayload(args);

    return payload.data;
};

/**
 * Should be used to get function display name
 *
 * @method displayName
 * @return {String} display name of the function
 */
Func.prototype.displayName = function () {
    return utils.extractDisplayName(this._name);
};

/**
 * Should be used to get function type name
 *
 * @method typeName
 * @return {String} type name of the function
 */
Func.prototype.typeName = function () {
    return utils.extractTypeName(this._name);
};

/**
 * Should be called to get rpc requests from function
 *
 * @method request
 * @returns {Object}
 */
Func.prototype.request = function () {
    var args = Array.prototype.slice.call(arguments);
    var callback = this.extractCallback(args);
    var payload = this.toPayload(args);
    var format = this.unpackOutput.bind(this);

    return {
        method: this._constant ? 'callContract' : 'sendContract',
        callback: callback,
        params: [payload],
        format: format
    };
};

/**
 * Should be called to execute function
 *
 * @method execute
 */
Func.prototype.execute = function () {
    var transaction = !this._constant;

    // send transaction
    if (transaction) {
        return this.sendTransaction.apply(this, Array.prototype.slice.call(arguments));
    }

    // call
    return this.call.apply(this, Array.prototype.slice.call(arguments));
};

/**
 * Should be called to attach function to contract
 *
 * @method attachToContract
 * @param {Contract}
 */
Func.prototype.attachToContract = function (contract) {
    var execute = this.execute.bind(this);
    execute.request = this.request.bind(this);
    execute.call = this.call.bind(this);
    execute.sendTransaction = this.sendTransaction.bind(this);
    execute.estimateGas = this.estimateGas.bind(this);
    execute.getData = this.getData.bind(this);
    var displayName = this.displayName();
    if (!contract[displayName]) {
        contract[displayName] = execute;
    }
    contract[displayName][this.typeName()] = execute; // circular!!!!
};

module.exports = Func;
