var Client = require('../index').Client;

var client = new Client('localhost', {});

client.connect(function() {
    client.query('USE marlin;', function(err, result) {
        console.log(err);
        console.log(result);
    });
});