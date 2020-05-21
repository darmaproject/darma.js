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
 * @file darma.js
 * @authors:
 *   Jeffrey Wilcke <jeff@ethdev.com>
 *   Marek Kotewicz <marek@ethdev.com>
 *   Marian Oancea <marian@ethdev.com>
 *   Fabian Vogelsteller <fabian@ethdev.com>
 *   Gav Wood <g@ethdev.com>
 * @date 2014
 */

var RequestManager = require('./darma/requestmanager');
var Iban = require('./darma/iban');
var Wallet = require('./darma/methods/wallet');
var Chain = require('./darma/methods/chain');
var Settings = require('./darma/settings');
var version = require('./version.json');
var utils = require('./utils/utils');
var sha3 = require('./utils/sha3');
var Hash = require('./utils/hash');
var extend = require('./darma/extend');
var Batch = require('./darma/batch');
var Property = require('./darma/property');
var HttpProvider = require('./darma/httpprovider');
var IpcProvider = require('./darma/ipcprovider');
var BigNumber = require('bignumber.js');



function Darma (provider) {
    this._requestManager = new RequestManager(provider);
    this.currentProvider = provider;
    this.hash = Hash;
    this.utils = utils;
    this.wallet = new Wallet(this);
    this.chain = new Chain(this);
    this.settings = new Settings();
    this.version = {
        api: version.version
    };
    this.providers = {
        HttpProvider: HttpProvider,
        IpcProvider: IpcProvider
    };
    this._extend = extend(this);
    this._extend({
        properties: properties()
    });
}

// expose providers on the class
Darma.providers = {
    HttpProvider: HttpProvider,
    IpcProvider: IpcProvider
};

Darma.prototype.setProvider = function (provider) {
    this._requestManager.setProvider(provider);
    this.currentProvider = provider;
};

Darma.prototype.reset = function (keepIsSyncing) {
    this._requestManager.reset(keepIsSyncing);
    this.settings = new Settings();
};

Darma.prototype.BigNumber = BigNumber;
Darma.prototype.toHex = utils.toHex;
Darma.prototype.toAscii = utils.toAscii;
Darma.prototype.toUtf8 = utils.toUtf8;
Darma.prototype.fromAscii = utils.fromAscii;
Darma.prototype.fromUtf8 = utils.fromUtf8;
Darma.prototype.toDecimal = utils.toDecimal;
Darma.prototype.fromDecimal = utils.fromDecimal;
Darma.prototype.toBigNumber = utils.toBigNumber;
Darma.prototype.toWei = utils.toWei;
Darma.prototype.fromWei = utils.fromWei;
Darma.prototype.isAddress = utils.isAddress;
Darma.prototype.isChecksumAddress = utils.isChecksumAddress;
Darma.prototype.toChecksumAddress = utils.toChecksumAddress;
Darma.prototype.isIBAN = utils.isIBAN;
Darma.prototype.padLeft = utils.padLeft;
Darma.prototype.padRight = utils.padRight;


Darma.prototype.sha3 = function(string, options) {
    return '0x' + sha3(string, options);
};

/**
 * Transforms direct icap to address
 */
Darma.prototype.fromICAP = function (icap) {
    var iban = new Iban(icap);
    return iban.address();
};

var properties = function () {
    return [
        new Property({
            name: 'version.node',
            getter: 'darma_clientVersion'
        }),
        new Property({
            name: 'version.network',
            getter: 'net_version',
            inputFormatter: utils.toDecimal
        }),
        new Property({
            name: 'version.darma',
            getter: 'core_protocolVersion',
            inputFormatter: utils.toDecimal
        }),
        new Property({
            name: 'version.whisper',
            getter: 'shh_version',
            inputFormatter: utils.toDecimal
        })
    ];
};

Darma.prototype.isConnected = function(){
    return (this.currentProvider && this.currentProvider.isConnected());
};

Darma.prototype.createBatch = function () {
    return new Batch(this);
};

module.exports = Darma;
