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
/** @file config.js
 * @authors:
 *   Marek Kotewicz <marek@ethdev.com>
 * @date 2015
 */

/**
 * Utils
 *
 * @module utils
 */

/**
 * Utility functions
 *
 * @class [utils] config
 * @constructor
 */


/// required to define DARMA_BIGNUMBER_ROUNDING_MODE
var BigNumber = require('bignumber.js');

var DARMA_UNITS = [
    'wei',
    'Kwei',
    'Mwei',
    'Gwei',
    'microdarma',
    'micro',
    'millidarma',
    'milli',
    'darma'
];

module.exports = {
    DARMA_PADDING: 32,
    DARMA_SIGNATURE_LENGTH: 4,
    DARMA_UNITS: DARMA_UNITS,
    DARMA_BIGNUMBER_ROUNDING_MODE: { ROUNDING_MODE: BigNumber.ROUND_DOWN },
    DARMA_POLLING_TIMEOUT: 1000*2,
    defaultBlock: 'latest',
    defaultAccount: undefined
};
