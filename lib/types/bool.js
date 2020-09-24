var f = require('./formatters');
var Type = require('./type');

/**
 * TypeBool is a prootype that represents bool type
 * It matches:
 * bool
 * bool[]
 * bool[4]
 * bool[][]
 * bool[3][]
 * bool[][6][], ...
 */
var TypeBool = function () {
    this._inputFormatter = f.formatInputBool;
    this._outputFormatter = f.formatOutputBool;
};

TypeBool.prototype = new Type({});
TypeBool.prototype.constructor = TypeBool;

TypeBool.prototype.isType = function (name) {
    return !!name.match(/^bool(\[([0-9]*)\])*$/);
};

module.exports = TypeBool;
