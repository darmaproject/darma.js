var f = require('./formatters');
var Type = require('./type');

/**
 * TypeReal is a prootype that represents real type
 * It matches:
 * real
 * real[]
 * real[4]
 * real[][]
 * real[3][]
 * real[][6][], ...
 * real32
 * real64[]
 * real8[4]
 * real256[][]
 * real[3][]
 * real64[][6][], ...
 */
var TypeReal = function () {
    this._inputFormatter = f.formatInputReal;
    this._outputFormatter = f.formatOutputReal;
};

TypeReal.prototype = new Type({});
TypeReal.prototype.constructor = TypeReal;

TypeReal.prototype.isType = function (name) {
    return !!name.match(/real([0-9]*)?(\[([0-9]*)\])?/);
};

module.exports = TypeReal;
