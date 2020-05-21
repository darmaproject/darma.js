var f = require('./formatters');
var Type = require('./type');

/**
 * TypeUInt is a prootype that represents uint type
 * It matches:
 * uint
 * uint[]
 * uint[4]
 * uint[][]
 * uint[3][]
 * uint[][6][], ...
 * uint32
 * uint64[]
 * uint8[4]
 * uint256[][]
 * uint[3][]
 * uint64[][6][], ...
 */
var TypeUInt = function () {
    this._inputFormatter = f.formatInputInt;
    this._outputFormatter = f.formatOutputUInt;
};

TypeUInt.prototype = new Type({});
TypeUInt.prototype.constructor = TypeUInt;

TypeUInt.prototype.isType = function (name) {
    return !!name.match(/^uint([0-9]*)?(\[([0-9]*)\])*$/);
};

module.exports = TypeUInt;
