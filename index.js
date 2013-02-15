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

        client.on('data', handleData);

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

    //send a frame with a new streamID (queuing if necessary) and register a callback
    function sendStream(frameBuilder, callback) {
        var stream = streamIDs.pop();
        replyCallbacks[stream] = callback;
    }

    function handleData(data) {
        //...
        var stream = data.readUInt8(2);
        
        var callback = replyCallbacks[stream];

        if(callback) {
            streamIDs.push(stream);
            delete replyCallbacks[stream];
            callback();
        }
    }
};