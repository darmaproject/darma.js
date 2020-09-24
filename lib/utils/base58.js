var BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
var BytesToBase58LengthMapping = [
    0,  // 0 bytes of input, 0 byte of base58 output
    2,  // 1 byte of input, 2 bytes of base58 output
    3,  // 2 byte of input, 3 bytes of base58 output
    5,  // 3 byte of input, 5 bytes of base58 output
    6,  // 4 byte of input, 6 bytes of base58 output
    7,  // 5 byte of input, 7 bytes of base58 output
    9,  // 6 byte of input, 9 bytes of base58 output
    10, // 7 byte of input, 10 bytes of base58 output
    11, // 8 byte of input, 11 bytes of base58 output
]
var base58 = require('base-x')(BASE58)
var hash = require('./hash.js');

function decodeBase58Address(address) {
    var raw = decodeDarmaBase58(address);
    if (raw.length < 69) { // 1 byte prefix + 32 byte key + 32 byte key + 4 byte checksum
        // err = fmt.Errorf("Address is not complete");
        return "";
    }

    var checksum = getChecksum(raw.slice(0, -4));
    if (checksum.compare(raw.slice(-4)) !== 0) {
        // err = fmt.Errorf("Checksum failed")
        return "";
    }
    raw = raw.slice(0, -4);
    var prefix = uvarint(raw);

    if (prefix.done <= 0) {
        // err = fmt.Errorf("Network could not be parsed in address\n")
        return "";
    }
    raw = raw.slice(prefix.done);

    return "0x" + raw.slice(0,32).toString("hex");
}

function getChecksum(data) {
    var keccak256 = hash.keccak256(data);
    return Buffer.from(keccak256, "hex").slice(0,4);
}

function decodeDarmaBase58(data) {
    var fullblocks = Math.floor(data.length / 11);
    var result = Buffer.alloc(0);
    for (var i = 0; i < fullblocks; i++) { // process partial block
        result = Buffer.concat([result, decode(data.slice(i*11,(i+1)*11))]);
    }
    if (data.length%11 > 0) { // process last partial block
        result = Buffer.concat([result, decode(data.slice(fullblocks*11))]);
    }
    return result;
}

function decode(encoded) {
    var result = base58.decode(encoded)

    for (var i = 0; i < BytesToBase58LengthMapping.length; i++) {
        if (BytesToBase58LengthMapping[i] === encoded.length) {
            result = Buffer.concat([Buffer.alloc(9), result])
            return result.slice(-i); // return necessary bytes, initial zero appended  as per mapping
        }
    }
}

function uvarint(buf) {
    var x = 0;
    var s = 0;
    for (var i = 0; i < buf.length; i++) {
        var b = buf[i];
        if (b < 0x80) {
            if (i > 9 || i === 9 && b > 1) {
                return {num: 0, done:-(i + 1)}; // overflow
            }
            return {num: x | b<<s, done:i + 1};
        }
        x |= b&0x7f << s;
        s += 7;
    }
    return {num: 0, done:0};
}

module.exports = {
    decodeBase58Address: decodeBase58Address
}
