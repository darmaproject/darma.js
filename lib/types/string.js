var f = require('./formatters');
var Type = require('./type');

var TypeString = function () {
    this._inputFormatter = f.formatInputString;
    this._outputFormatter = f.formatOutputString;
};

TypeString.prototype = new Type({});
TypeString.prototype.constructor = TypeString;

TypeString.prototype.isType = function (name) {
    return !!name.match(/^string(\[([0-9]*)\])*$/);
};

TypeString.prototype.isDynamicType = function () {
    return true;
};

module.exports = TypeString;
