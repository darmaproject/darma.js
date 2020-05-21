var f = require('./formatters');
var Type = require('./type');

/**
 * TypeInt is a prootype that represents int type
 * It matches:
 * int
 * int[]
 * int[4]
 * int[][]
 * int[3][]
 * int[][6][], ...
 * int32
 * int64[]
 * int8[4]
 * int256[][]
 * int[3][]
 * int64[][6][], ...
 */
var TypeInt = function () {
    this._inputFormatter = f.formatInputInt;
    this._outputFormatter = f.formatOutputInt;
};

TypeInt.prototype = new Type({});
TypeInt.prototype.constructor = TypeInt;

TypeInt.prototype.isType = function (name) {
    return !!name.match(/^int([0-9]*)?(\[([0-9]*)\])*$/);
};

module.exports = TypeInt;
