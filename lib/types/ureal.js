var f = require('./formatters');
var Type = require('./type');

/**
 * TypeUReal is a prootype that represents ureal type
 * It matches:
 * ureal
 * ureal[]
 * ureal[4]
 * ureal[][]
 * ureal[3][]
 * ureal[][6][], ...
 * ureal32
 * ureal64[]
 * ureal8[4]
 * ureal256[][]
 * ureal[3][]
 * ureal64[][6][], ...
 */
var TypeUReal = function () {
    this._inputFormatter = f.formatInputReal;
    this._outputFormatter = f.formatOutputUReal;
};

TypeUReal.prototype = new Type({});
TypeUReal.prototype.constructor = TypeUReal;

TypeUReal.prototype.isType = function (name) {
    return !!name.match(/^ureal([0-9]*)?(\[([0-9]*)\])*$/);
};

module.exports = TypeUReal;
