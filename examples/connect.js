var Client = require('../index').Client;

var client = new Client('localhost', {});

client.connect(function() {
    console.log('ready');
});