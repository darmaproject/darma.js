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

function Chain(darma) {
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
    var getBlockTemplate = new Method({
        name: 'getBlockTemplate',
        call: 'getblocktemplate',
        inputFormatter: {wallet_address: null, reserve_size: null},
    });
    var getLastBlockHeader = new Method({
        name: 'getLastBlockHeader',
        call: 'getlastblockheader',
    });
    var getBlockHeaderByHash = new Method({
        name: 'getBlockHeaderByHash',
        call: 'getblockheaderbyhash',
        inputFormatter: {hash: null},
    });
    var getBlockHeaderByHeight = new Method({
        name: 'getBlockHeaderByHeight',
        call: 'getblockheaderbyheight',
        inputFormatter: {height: null},
    });
    var getBlockHeaderByTopoHeight = new Method({
        name: 'getBlockHeaderByTopoHeight',
        call: 'getblockheaderbytopoheight',
        inputFormatter: {topoheight: null},
    });
    var getBlock = new Method({
        name: 'getBlock',
        call: 'getblock',
        inputFormatter: {hash: null, height: null},
    });
    var getStakePool = new Method({
        name: 'getStakePool',
        call: 'get_stake_pool',
        inputFormatter: {pool_id: null},
    });
    var listStakePool = new Method({
        name: 'listStakePool',
        call: 'list_stake_pool',
    });
    var listShare = new Method({
        name: 'listShare',
        call: 'list_share',
        inputFormatter: {pool_id: null, include_vote_records: null},
    });
    var getShare = new Method({
        name: 'getShare',
        call: 'get_share',
        inputFormatter: {include_vote_records: null, tx_id: null, share_id:null},
    });
    var getContractAddressByTxhash = new Method({
        name: 'getContractAddressByTxhash',
        call: 'get_contract_address_by_txhash',
        inputFormatter: {hash: null},
    });
    var callContract = new Method({
        name: 'callContract',
        call: 'call_contract',
        inputFormatter: {from: null, to: null, amount: null, gas:null, gasPrice:null, data:null, nonce:null, topoHeight:null},
    });
    var getContractResult = new Method({
        name: 'getContractResult',
        call: 'get_contract_result',
        inputFormatter: {tx_hash: null},
    });

    return [
        getBlockTemplate,
        getLastBlockHeader,
        getBlockHeaderByHash,
        getBlockHeaderByHeight,
        getBlockHeaderByTopoHeight,
        getBlock,
        getStakePool,
        listStakePool,
        listShare,
        getShare,
        getContractAddressByTxhash,
        callContract,
        getContractResult
    ];
};

var properties = function () {
    return [
        new Property({
            name: 'blockCount',
            getter: 'getblockcount',
        }),
        new Property({
            name: 'info',
            getter: 'get_info',
        }),
        new Property({
            name: 'txpool',
            getter: 'gettxpool',
        }),
    ];
};

module.exports = Chain;
