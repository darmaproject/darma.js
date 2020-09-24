var Darma = require('./lib/darma');

// dont override global variable
if (typeof window !== 'undefined' && typeof window.Darma === 'undefined') {
    window.Darma = Darma;
}

module.exports = Darma;
