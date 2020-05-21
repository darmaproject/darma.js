var f = require('./formatters');
var Type = require('./type');

/**
 * TypeBytes is a prototype that represents the bytes type.
 * It matches:
 * bytes
 * bytes[]
 * bytes[4]
 * bytes[][]
 * bytes[3][]
 * bytes[][6][], ...
 * bytes32
 * bytes8[4]
 * bytes[3][]
 */
var TypeBytes = function () {
    this._inputFormatter = f.formatInputBytes;
    this._outputFormatter = f.formatOutputBytes;
};

TypeBytes.prototype = new Type({});
TypeBytes.prototype.constructor = TypeBytes;

TypeBytes.prototype.isType = function (name) {
    return !!name.match(/^bytes([0-9]{1,})(\[([0-9]*)\])*$/);
};

module.exports = TypeBytes;
