/* jshint ignore:start */


// Browser environment
if(typeof window !== 'undefined') {
    Darma = (typeof window.Darma !== 'undefined') ? window.Darma : require('darma');
    BigNumber = (typeof window.BigNumber !== 'undefined') ? window.BigNumber : require('bignumber.js');
}


// Node environment
if(typeof global !== 'undefined') {
    Darma = (typeof global.Darma !== 'undefined') ? global.Darma : require('darma');
    BigNumber = (typeof global.BigNumber !== 'undefined') ? global.BigNumber : require('bignumber.js');
}

/* jshint ignore:end */
