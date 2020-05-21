#!/usr/bin/env node

var Darma = require('../index.js');
var fs = require("fs")
var darma = new Darma();

darma.setProvider(new darma.providers.HttpProvider('http://localhost:23805/json_rpc'));

console.log(darma.isConnected())
var payments = darma.wallet.getBulkPayments({payment_ids: [], min_block_height: 123});
var addr = darma.wallet.makeIntegratedAddress({payment_id:""});
var split = darma.wallet.splitIntegratedAddress({integrated_address:"dTis5dZCkb6NM9BQ1czT1ZfQAydwfzK9VEsssU9KJ3eu7sJrUz1NMvt2JKRhzkAv7gFP7SSbnuTWa1Do9oHCLWGn3R6MTU1g12U5aKZzuXvwm"});
var trans = darma.wallet.getTransferByTxid({txid:"fb134f785a650d8f94af300414103eda2eac3e57eb5399ecd825884732870518"});
// var trans = darma.wallet.getTransfers({in: true, out: true, pending:null,failed:null,pool:null,filter_by_height:null,min_height:100,max_height:200});

console.log(payments);
console.log(addr);
console.log(split);
console.log(darma.wallet.balance);
console.log(darma.wallet.address);
console.log(darma.wallet.getHeight(function (e,r) {
    console.log(e,r)
}));
console.log(trans);
