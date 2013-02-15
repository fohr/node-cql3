var net = require('net'),
    binary = require('binary'),
    protocol = require('./protocol'),
    Frame = require('./protocol').Frame;


var Client = exports.client = function(host, port, opts) {
    var client = null;

    var streamIDs = [];
    for(var i = 0; i < 128; i++)
        streamIDs.push(i);

    var streamCallbacks = {};

    function send(frame, callback) {
        /* send the message */
        client.write(frame.toBuffer());
        streamCallbacks[streamIDs.pop()] = callback;
    }

    function handleData(data) {
        
    }

    function startupConnection(callback) {
        var frame = new Frame(protocol.STARTUP, protocol.toStringMap({
            CQL_VERSION: '3.0.0'
        }));

        send(frame, function(frame) {
            switch(frame.opcode) {
            case protocol.READY:
                callback();
                break;
            case protocol.AUTHENTICATE:
                authenticate(callback);
                break;
            case protocol.ERROR: 
                callback(frame.toError());
                break;
            }
        });
    }

    function authenticate(info, callback) {
        var message;
        send(message, function(frame) {
            switch(frame.opcode) {
            case protocol.READY:
                callback();
                break;
            case protocol.ERROR:
                callback(frame.toError());
                break;
            }
        });
    }

    this.connect = function(callback) {
        client = net.connect({ host: host, port: port }, function() {
            startupConnection(callback);
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

    this.prepare = function(callback) {

    };

    this.exec = function(callback) {

    };
};
