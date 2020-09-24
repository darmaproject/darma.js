var f = require('./formatters');
var Type = require('./type');

/**
 * TypeAddress is a prootype that represents address type
 * It matches:
 * address
 * address[]
 * address[4]
 * address[][]
 * address[3][]
 * address[][6][], ...
 */
var TypeAddress = function () {
    this._inputFormatter = f.formatInputAddress;
    this._outputFormatter = f.formatOutputAddress;
};

TypeAddress.prototype = new Type({});
TypeAddress.prototype.constructor = TypeAddress;

TypeAddress.prototype.isType = function (name) {
    return !!name.match(/address(\[([0-9]*)\])?/);
};

module.exports = TypeAddress;
