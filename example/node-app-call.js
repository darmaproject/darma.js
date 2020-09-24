#!/usr/bin/env node

var Darma = require('../index.js');
var fs = require("fs")
var darma = new Darma();

darma.setProvider(new darma.providers.HttpProvider('http://localhost:23805/json_rpc'));

var codeFile = "../../darma-contract-demo/contract/output/$Dice.compress"
var abiFile = "../../darma-contract-demo/contract/output/$Dice.abi"
var wasmabi = fs.readFileSync(abiFile)

var abi = JSON.parse(wasmabi.toString("utf-8"))

var contractAddr = "dTwyeSu9uwhHQhoyspiSUMhHvuQu1CnN1foYi73kUiKwhoZ2cxLTDnNXFvVkYt2XFkdoK2Fs83sfSU5SKsAGSLRK1URd1k65R"
var myContract = darma.wallet.contract(abi).at(contractAddr)
var r = myContract.GetAmount.call({topoHeight: 0, gas: 200000, gasPrice: 10})
console.log("result", r.toString())
myContract.$Deposit.sendTransaction({
    amount: 100,
    gas: 2000000,
    gasPrice: 10
},  function(err, txid) {
    if(err) {
        console.log("error happend: ", err)
    } else {
        console.log("txid: ", txid)
    }
})
