# **Darma(TestNet) Smart Contract JS SDK Tutorial**

## **Wallet**

### You need to run a wallet to use the darma.js sdk

* darma-wallet-cli --testNet --rpc-server --rpc-bind=127.0.0.1:13805 --wallet-file contract.wallet --password WALLETPASSWORD
* Parameter Description:
   * --rpc-server：enable rpc interface(If not specified, it will not be enabled by default.)
   * --rpc-bind：specify the IP address and port bound to the rpc interface
   * --wallet-file：specify the wallet file.(If the wallet is not specified, please follow the command line to create it.)
   * --password：specify the password of the wallet (this parameter is not recommended for security reason. The program will prompt you to enter the password when wallet password is not specified.)
   * More parameters can be viewer by --help

## **Installation**

* Download nodejs from `https://nodejs.org/en/download/`, the minimum version required is v8.11.2
* Init a local application directory
   * `mkdir dj-test && cd dj-test`
   * `npm init`
   * Install darma.js: `npm install git+https://github.com/darmaproject/darma.js.git`

## **Usage**

* Import darma.js library
```
var Darma = require("darma")
```

* Set a provider (HttpProvider)
```
if (typeof darma !== 'undefined') {
   darma = new Darma(darma.currentProvider);
} else {
   // set the provider you want from Darma.providers
   darma = new Darma(new darma.providers.HttpProvider("http://localhost:13805/json_rpc"));
}
```

## **Contract examples**

### The examples below use a [ERC20](#erc20) contract `USDT`

* [Create Contract](#create-contract)
* [Call Contract](#call-contract)
* [Send Contract](#send-contract)
* [Other RPC Examples](#rpc-examples)

### **create-contract**

```
#!/usr/bin/env node

var Darma = require('darma');
var fs = require("fs")
var darma = new Darma();

darma.setProvider(new darma.providers.HttpProvider('http://localhost:13805/json_rpc'));

// specify the compressed code file path
var codeFile = "usdt.compress"
// specify the abi file path
var abiFile = "usdt.abi"
// read the abi file
var wasmabi = fs.readFileSync(abiFile)
// unmarshal abi data
var abi = JSON.parse(wasmabi.toString("utf-8"))
var contract = darma.wallet.contract(abi).codeFile(codeFile)

// create contract, passing the contract parameters，or
var contractReturned = contract.new(21000000, "DarmaCash", "USDT", {
    data: contract.code,
    gas: 2000000, // gas limit(the default gas limit is 90000)
    gasPrice: 10 // gas price(in DMC atomic units, the default gas price is 0.00000040 DMC, i.e. 40 atomic units)
}, function(err, myContract){
    if(err) {
        console.log(err)
    }else{
        if(!myContract.address) {
            console.log("transactionHash: ", myContract.transactionHash)
        } else {
            // a successful creation will return the contract's address
            console.log("contract address: ", myContract.address)
        }
    }
});
// console.log(contractReturned)

```

### **call-contract**

Calling contract doesn't change the chain state, for example, query the token balance

```
#!/usr/bin/env node

var Darma = require('darma');
var fs = require("fs")
var darma = new Darma();

darma.setProvider(new darma.providers.HttpProvider('http://localhost:13805/json_rpc'));

// specify the compressed code file path
var codeFile = "usdt.compress"
// specify the abi file path
var abiFile = "usdt.abi"
// read the abi file
var wasmabi = fs.readFileSync(abiFile)
// unmarshal abi data
var abi = JSON.parse(wasmabi.toString("utf-8"))

// using address of the previously created contract 
var contractAddr = "dTvPb54zVKRi8SFKHHbEN84PJKgiq3YuqVUnwML22eQS4aH2yP7hq6vWmKQSpSGHTC1pcK6Zr4qhrQNhUa2wjcU72HjxvmwuV"
var myContract = darma.wallet.contract(abi).at(contractAddr)
// pass the params
var r = myContract.balanceOf.call("dTw8yKUhy4FbtvLrhaXdUpKbSNqNkoAh9LZ5FWf8V5NDGjKmoLc4GJPShCeErjBsBe6mNGAN2QvD8ieSzVmAofaK1DSq3PnYD", {gas: 200000, gasPrice: 10})
console.log("result", r.toString())
```

### **send-contract**

Sending a contract transaction changes the chain state, for example, transfer tokens

```
#!/usr/bin/env node

var Darma = require('darma');
var fs = require("fs")
var darma = new Darma();

darma.setProvider(new darma.providers.HttpProvider('http://localhost:13805/json_rpc'));

var codeFile = "contracts/usdt/usdt.compress"
var abiFile = "contracts/usdt/usdt.abi"
var wasmabi = fs.readFileSync(abiFile)
var abi = JSON.parse(wasmabi.toString("utf-8"))

var contractAddr = "dTwq4Zy3Z8gKSdFdyMnAdPSAYnCR6FxkBFrhgv7mhGv5eLbjM7849UuGwRwnmw5woe9mBtVjS279DMcE6Nxe1mNs1UV6c24qd"
var myContract = darma.wallet.contract(abi).at(contractAddr)
myContract.transfer.sendTransaction("dTw7r5qoAQXNY9vm9NzPxUB2rTr5VZMDhSXuS7mdAd7X9fhEYLgQrBCMCJvz9zuA6WhdTMSocjCScaHWcNqH2XKi1eSpz1ARH", 12345, {
    amount: 0,
    gas: 2000000,
    gasPrice: 10
},  function(err, txid) {
    if(err) {
        console.log("error happend: ", err)
    } else {
        console.log("txid: ", txid)
    }
})
```

### **rpc-examples**

* *get_contract_result*

Retrieve a send contract result by tx hash

```
#!/usr/bin/env node

var Darma = require('darma');
var darma = new Darma();

darma.setProvider(new darma.providers.HttpProvider('http://localhost:13805/json_rpc'));

//var trans = darma.wallet.getTokenTransfers({in: true, out: true, filter_by_height:true,min_height:1200,max_height:5000});
//console.log(trans)

var r = darma.wallet.getContractResult({tx_hash: "e56631beda825c24576e2358bf956795360dfc0bed35224772975cf628eb6ea3"});
console.log(r)

// output
{
  data: '0000000000000000000000000000000000000000000000000000000000000001'
}
```

* *get_token_transfers*

Retrive token transfers filtered by min height and max height

```
#!/usr/bin/env node

var Darma = require('darma');
var darma = new Darma();

darma.setProvider(new darma.providers.HttpProvider('http://localhost:13805/json_rpc'));

var trans = darma.wallet.getTokenTransfers({in: true, out: true, filter_by_height:true,min_height:1200,max_height:5000});
console.log(trans)

// output:
{
  out: [
    {
      index_global: 4400,
      height: 4383,
      topoheight: 4383,
      txid: 'f68b18320504f2318e81ebe2476cbb9ad4c57be56f82233d7bed20ccd5e001f5',
      amount: '12345',
      status: 1,
      block_time: 1589796006,
      contract: 'dTwq4Zy3Z8gKSdFdyMnAdPSAYnCR6FxkBFrhgv7mhGv5eLbjM7849UuGwRwnmw5woe9mBtVjS279DMcE6Nxe1mNs1UV6c24qd',
      type: 'out'
    },
    {
      index_global: 2327,
      height: 2315,
      topoheight: 2315,
      txid: '93cc014ee3c5602563deb4881bd5067b0acf36bbca0f1a851fa2265a6ebdbb5c',
      amount: '12345',
      status: 1,
      block_time: 1589775630,
      contract: 'dTvPb54zVKRi8SFKHHbEN84PJKgiq3YuqVUnwML22eQS4aH2yP7hq6vWmKQSpSGHTC1pcK6Zr4qhrQNhUa2wjcU72HjxvmwuV',
      type: 'out'
    }
  ]
}

```

### **erc20**

A ERC20 contract is a contract containing the following standard functions:

* *totalSupply()* - uint256; returns the total token supply
* *balanceOf(address addr)* - uint256; returns the balance of `addr`
* *allowance(address owner, address spender)* - uint256; returns the max amount that `spender` can transfer on behalf of `owner`
* *transfer(address addr, uint256 value)* - bool; transfer `value` tokens to `addr`
* *transferFrom(address from, address to, uint256 value)* - bool; Send `value` tokens to `to` on behalf of `from`
* *approve(address spender, uint256 value)* - bool; allows `spender` to spend no more than `value` tokens on your behalf

and, the following events:
* *Approval(address owner, address spender, uint256 value)* - Generated after calling approve
* *Transfer(address from, address to, uint256 value)* - Generated after calling transfer

also, erc20 contracts often implemented the following functions:
* *decimals()* - uint256; returns the decimals of token unit
* *symbol()* - string; returns the symbol name of the token, for example, `USDT`
* *name()* - string; returns the generic name of the token, for example, `DarmaCash USDT`

