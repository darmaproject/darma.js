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
 * @file personal.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @author Fabian Vogelsteller <fabian@ethdev.com>
 * @date 2015
 */

"use strict";

var Method = require('../method');
var Property = require('../property');
var formatters = require('../formatters');
var watches = require('./watches');
var Filter = require('../filter');
var Contract = require('../contract');

function Wallet(darma) {
    this._requestManager = darma._requestManager;

    var self = this;

    methods().forEach(function(method) {
        method.attachToObject(self);
        method.setRequestManager(self._requestManager);
    });

    properties().forEach(function(p) {
        p.attachToObject(self);
        p.setRequestManager(self._requestManager);
    });
}

var methods = function () {
    var queryKey = new Method({
        name: 'queryKey',
        call: 'query_key',
        params: 1,
        inputFormatter: {key_type: null},
    });
    var transfer = new Method({
        name: 'transfer',
        call: 'transfer',
        inputFormatter: {destinations: null, fee: null, mixin: null, unlock_time: null, payment_id: null, get_tx_key: null, priority: null, do_not_relay: null, get_tx_hex: null},
    });
    var transferSplit = new Method({
        name: 'transferSplit',
        call: 'transfer_split',
        inputFormatter: {destinations: null, fee: null, mixin: null, unlock_time: null, payment_id: null, get_tx_key: null, priority: null, do_not_relay: null, get_tx_hex: null},
    });
    var getBulkPayments = new Method({
        name: 'getBulkPayments',
        call: 'get_bulk_payments',
        inputFormatter: {payment_ids: null, min_block_height: null},
    });
    var makeIntegratedAddress = new Method({
        name: 'makeIntegratedAddress',
        call: 'make_integrated_address',
        inputFormatter: {payment_id: null},
    });
    var splitIntegratedAddress = new Method({
        name: 'splitIntegratedAddress',
        call: 'split_integrated_address',
        inputFormatter: {integrated_address: null},
    });
    var getTransferByTxid = new Method({
        name: 'getTransferByTxid',
        call: 'get_transfer_by_txid',
        inputFormatter: {txid: null},
    });
    var getTransfers = new Method({
        name: 'getTransfers',
        call: 'get_transfers',
        inputFormatter: {in: null, out: null, pending:null,failed:null,pool:null,filter_by_height:null,min_height:null,max_height:null},
    });
    var getTokenTransfers = new Method({
        name: 'getTokenTransfers',
        call: 'get_token_transfers',
        inputFormatter: {in: null, out: null, filter_by_height: null, min_height: null, max_height: null},
    });
    var registerStakePool = new Method({
        name: 'registerStakePool',
        call: 'register_stake_pool',
        inputFormatter: {name: null, vote: null, reward:null,fee:null},
    });
    var closeStakePool = new Method({
        name: 'closeStakePool',
        call: 'close_stake_pool',
    });
    var buyShare = new Method({
        name: 'buyShare',
        call: 'buy_share',
        inputFormatter: {reward: null, pool_id: null, value:null},
    });
    var repoShare = new Method({
        name: 'repoShare',
        call: 'repo_share',
        inputFormatter: {share_id: null},
    });
    var sign = new Method({
        name: 'sign',
        call: 'sign',
        inputFormatter: {data: null},
    });
    var verify = new Method({
        name: 'verify',
        call: 'verify',
        inputFormatter: {data: null, signature: null, address:null},
    });
    var createContract = new Method({
        name: 'createContract',
        call: 'create_contract',
        inputFormatter: {to: null, amount: null, gas:null, gasPrice:null, data:null, nonce:null},
    });
    var sendContract = new Method({
        name: 'sendContract',
        call: 'send_contract',
        inputFormatter: {to: null, amount: null, gas:null, gasPrice:null, data:null, nonce:null},
    });
    var callContract = new Method({
        name: 'call',
        call: 'call_contract',
        inputFormatter: {to: null, amount: null, gas:null, gasPrice:null, data:null, nonce:null, topoHeight:null},
    });
    var getContractAddressByTxhash = new Method({
        name: 'getContractAddressByTxhash',
        call: 'get_contract_address_by_txhash',
        inputFormatter: {hash: null},
    });
    var getContractResult = new Method({
        name: 'getContractResult',
        call: 'get_contract_result',
        inputFormatter: {tx_hash: null},
    });
    var createAddress = new Method({
        name: 'createAddress',
        call: 'create_address',
        inputFormatter: {count: null},
    });
    var listAddress = new Method({
        name: 'listAddress',
        call: 'list_address',
        inputFormatter: {address: null},
    });

    return [
        queryKey,
        transfer,
        transferSplit,
        getBulkPayments,
        makeIntegratedAddress,
        splitIntegratedAddress,
        getTransferByTxid,
        getTransfers,
        getTokenTransfers,
        registerStakePool,
        closeStakePool,
        buyShare,
        repoShare,
        sign,
        verify,
        createContract,
        sendContract,
        callContract,
        getContractAddressByTxhash,
        getContractResult,
        createAddress,
        listAddress
    ];
};

var properties = function () {
    return [
        new Property({
            name: 'balance',
            getter: 'getbalance',
            // outputFormatter: formatters.outputBalanceFormatter
        }),
        new Property({
            name: 'address',
            getter: 'getaddress'
        }),
        new Property({
            name: 'height',
            getter: 'getheight'
        }),
    ];
};


Wallet.prototype.contract = function (abi) {
    var factory = new Contract(this, abi);
    return factory;
};

Wallet.prototype.filter = function (options, callback) {
    return new Filter(options, 'darma', this._requestManager, watches.darma(), formatters.outputLogFormatter, callback);
};

module.exports = Wallet;
