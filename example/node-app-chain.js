#!/usr/bin/env node

var Darma = require('../index.js');
var darma = new Darma();

darma.setProvider(new darma.providers.HttpProvider('http://localhost:23804/json_rpc'));

var blockCount = darma.chain.blockCount;
console.log(blockCount.count)
var res = darma.chain.getBlockTemplate({wallet_address: "dTw9uVxN7a3CgtJJDBwncRBjuHQLwRfdvRJyFyQtvqwBFRE4xpH81yyWxfmzdMRhPHCZCvfmZLizRWprUGae4VCE1fPqULu3d", reserve_size: 1});
console.log(res)
