var net = require('net');

exports.Client = function(host, port, options) {

    //a store of available stream IDs for new requests
    var streamIDs = [];
    for(var i = 0; i < 128; i++)
        streamIDs.push(i);

    var replyCallbacks = {}; //TODO: queue requests if no stream IDs are available

    var client; //socket

    this.connect = function(callback) {
        function startup() {
            
        }

        client = net.connect({ 
            host: host,
            port: port
        }, function() {
            startup();
        });

        client.on('end', function() {
            client = null;
        });

        client.on('close', function() {
            client = null;
        });
    };

    this.query = function(query, callback) {

    };

    this.prepare = function(query, callback) {

    };

    this.execute = function(id, values, consistency, callback) {

    };

    this.disconnect = function() {

    };
};