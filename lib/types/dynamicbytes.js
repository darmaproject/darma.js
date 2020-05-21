var f = require('./formatters');
var Type = require('./type');

var TypeDynamicBytes = function () {
    this._inputFormatter = f.formatInputDynamicBytes;
    this._outputFormatter = f.formatOutputDynamicBytes;
};

TypeDynamicBytes.prototype = new Type({});
TypeDynamicBytes.prototype.constructor = TypeDynamicBytes;

TypeDynamicBytes.prototype.isType = function (name) {
    return !!name.match(/^bytes(\[([0-9]*)\])*$/);
};

TypeDynamicBytes.prototype.isDynamicType = function () {
    return true;
};

module.exports = TypeDynamicBytes;
