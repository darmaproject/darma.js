# Darma Cash Project JavaScript API

You need to run a local Darma Wallet/Node to use this library.

## Installation

### Node.js

```bash
npm install git+https://github.com/darmaproject/darma.js.git
```


* Include `darma.min.js` in your html file. (not required for the meteor package)

## Usage
Use the `darma` object directly from global namespace:

```js
console.log(darma); // {darma: ..} // it's here!
```

Set a provider (HttpProvider)

```js
if (typeof darma !== 'undefined') {
  darma = new Darma(darma.currentProvider);
} else {
  // set the provider you want from Darma.providers
  darma = new Darma(new darma.providers.HttpProvider("http://localhost:23805/json_rpc"));
}
```

Set a provider (HttpProvider using [HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication))

```js
darma.setProvider(new darma.providers.HttpProvider('http://host.url', 0, BasicAuthUsername, BasicAuthPassword));
```

There you go, now you can use it:

```js
var balance = darma.wallet.balance;
var viewKey = darma.wallet.queryKey({key_type: "view_key"});
```

## Contribute!

### Requirements

* Node.js
* npm

```bash
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
sudo apt-get install nodejs-legacy
```

### Building (gulp)

```bash
npm run build
```
