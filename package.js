/* jshint ignore:start */
Package.describe({
  name: 'darmaproject:darma',
  version: '0.20.7',
  summary: 'Darma JavaScript API, middleware to talk to a darma node over RPC',
  git: 'https://github.com/darmaproject/darma.js',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  "xmlhttprequest": "1.7.0"
});


Package.onUse(function(api) {
  api.versionsFrom('1.0.3.2');

  // api.use('3stack:bignumber@2.0.0', 'client');

  api.export(['Darma', 'BigNumber'], ['client', 'server']);

  api.addFiles('dist/darma.js', ['client', 'server']);
  api.addFiles('package-init.js', ['client', 'server']);
});

// Package.onTest(function(api) {
//   api.use('tinytest');
//   api.use('test');
//   api.addFiles('test-tests.js');
// });
/* jshint ignore:end */
