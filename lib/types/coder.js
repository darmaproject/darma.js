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
 * @file coder.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @date 2015
 */

var f = require('./formatters');

var TypeAddress = require('./address');
var TypeBool = require('./bool');
var TypeInt = require('./int');
var TypeUInt = require('./uint');
var TypeDynamicBytes = require('./dynamicbytes');
var TypeString = require('./string');
var TypeReal = require('./real');
var TypeUReal = require('./ureal');
var TypeBytes = require('./bytes');
var sha3 = require('../utils/sha3')

var isDynamic = function (Type, type) {
   return Type.isDynamicType(type) ||
          Type.isDynamicArray(type);
};

/**
 * Coder prototype should be used to encode/decode params of any type
 */
var Coder = function (types) {
    this._types = types;
};

/**
 * This method should be used to transform type to Type
 *
 * @method _requireType
 * @param {String} type
 * @returns {Type}
 * @throws {Error} throws if no matching type is found
 */
Coder.prototype._requireType = function (type) {
    var _type = this._types.filter(function (t) {
        return t.isType(type);
    })[0];

    if (!_type) {
        throw Error('invalid type!: ' + type);
    }

    return _type;
};

/**
 * Should be used to encode plain param
 *
 * @method encodeParam
 * @param {String} type
 * @param {Object} plain param
 * @return {String} encoded plain param
 */
Coder.prototype.encodeParam = function (type, param, indexed) {
    indexed = indexed || false
    if(type === "string" && indexed) {
        return sha3(param)
    }
    return this.encodeParams([type], [param], indexed);
};

/**
 * Should be used to encode list of params
 *
 * @method encodeParams
 * @param {Array} types
 * @param {Array} params
 * @return {String} encoded list of params
 */
Coder.prototype.encodeParams = function (types, params, indexed) {
    indexed = indexed || false
    var Types = this.getTypes(types);

    var encodeds = Types.map(function (Type, index) {
        return Type.encode(params[index], types[index]);
    });

    var dynamicOffset = Types.reduce(function (acc, Type, index) {
        var staticPartLength = Type.staticPartLength(types[index]);
        var roundedStaticPartLength = Math.floor((staticPartLength + 31) / 32) * 32;

        return acc + (isDynamic(Types[index], types[index]) ?
            32 :
            roundedStaticPartLength);
    }, 0);

    var result = this.encodeMultiWithOffset(types, Types, encodeds, dynamicOffset);

    return result;
};

Coder.prototype.encodeMultiWithOffset = function (types, Types, encodeds, dynamicOffset) {
    var result = "";
    var self = this;

    types.forEach(function (type, i) {
        if (isDynamic(Types[i], types[i])) {
            result += f.formatInputInt(dynamicOffset).encode();
            var e = self.encodeWithOffset(types[i], Types[i], encodeds[i], dynamicOffset);
            dynamicOffset += e.length / 2;
        } else {
            // don't add length to dynamicOffset. it's already counted
            result += self.encodeWithOffset(types[i], Types[i], encodeds[i], dynamicOffset);
        }

        // TODO: figure out nested arrays
    });

    types.forEach(function (type, i) {
        if (isDynamic(Types[i], types[i])) {
            var e = self.encodeWithOffset(types[i], Types[i], encodeds[i], dynamicOffset);
            dynamicOffset += e.length / 2;
            result += e;
        }
    });
    return result;
};

Coder.prototype.encodeWithOffset = function (type, Type, encoded, offset) {
    /* jshint maxcomplexity: 17 */
    /* jshint maxdepth: 5 */

    var self = this;
    var encodingMode={dynamic:1,static:2,other:3};

    var mode=(Type.isDynamicArray(type)?encodingMode.dynamic:(Type.isStaticArray(type)?encodingMode.static:encodingMode.other));

    if(mode !== encodingMode.other){
        var nestedName = Type.nestedName(type);
        var nestedStaticPartLength = Type.staticPartLength(nestedName);
        var result = (mode === encodingMode.dynamic ? encoded[0] : '');

        if (Type.isDynamicArray(nestedName)) {
            var previousLength = (mode === encodingMode.dynamic ? 2 : 0);

            for (var i = 0; i < encoded.length; i++) {
                // calculate length of previous item
                if(mode === encodingMode.dynamic){
                    previousLength += +(encoded[i - 1])[0] || 0;
                }
                else if(mode === encodingMode.static){
                    previousLength += +(encoded[i - 1] || [])[0] || 0;
                }
                result += f.formatInputInt(offset + i * nestedStaticPartLength + previousLength * 32).encode();
            }
        }

        var len= (mode === encodingMode.dynamic ? encoded.length-1 : encoded.length);
        for (var c = 0; c < len; c++) {
            var additionalOffset = result / 2;
            if(mode === encodingMode.dynamic){
                result += self.encodeWithOffset(nestedName, Type, encoded[c + 1], offset +  additionalOffset);
            }
            else if(mode === encodingMode.static){
                result += self.encodeWithOffset(nestedName, Type, encoded[c], offset + additionalOffset);
            }
        }

        return result;
    }

    return encoded;
};


/**
 * Should be used to decode bytes to plain param
 *
 * @method decodeParam
 * @param {String} type
 * @param {String} bytes
 * @return {Object} plain param
 */
Coder.prototype.decodeParam = function (type, bytes, indexed) {
    indexed = indexed || false
    return this.decodeParams([type], bytes, indexed)[0];
};

/**
 * Should be used to decode list of params
 *
 * @method decodeParam
 * @param {Array} types
 * @param {String} bytes
 * @return {Array} array of plain params
 */
Coder.prototype.decodeParams = function (types, bytes, indexed) {
    indexed = indexed || false
    var Types = this.getTypes(types);
    var offsets = this.getOffsets(types, Types);

    return Types.map(function (Type, index) {
        return Type.decode(bytes, offsets[index], types[index], indexed);
    });
};

Coder.prototype.getOffsets = function (types, Types) {
    var lengths =  Types.map(function (Type, index) {
        return Type.staticPartLength(types[index]);
    });

    for (var i = 1; i < lengths.length; i++) {
         // sum with length of previous element
        lengths[i] += lengths[i - 1];
    }

    return lengths.map(function (length, index) {
        // remove the current length, so the length is sum of previous elements
        var staticPartLength = Types[index].staticPartLength(types[index]);
        return length - staticPartLength;
    });
};

Coder.prototype.getTypes = function (types) {
    var self = this;
    return types.map(function (type) {
        return self._requireType(type);
    });
};

var coder = new Coder([
    new TypeAddress(),
    new TypeBool(),
    new TypeInt(),
    new TypeUInt(),
    new TypeDynamicBytes(),
    new TypeBytes(),
    new TypeString(),
    new TypeReal(),
    new TypeUReal()
]);

module.exports = coder;
