var net = require('net'),
    FrameParser = require('./lib/frameParser').FrameParser,
    FrameBuilder = require('./lib/frameBuilder').FrameBuilder;

//Default port: 9042
var Client = exports.Client = function(host, port, options) {
    if(options == null) {
        options = port;
        port = 9042;
    }

    if(options == null)
        options = {};

    if(!options.version)
        options.version = '3.0.0';

    //a store of available stream IDs for new requests
    var streamIDs = [];
    for(var i = 0; i < 128; i++)
        streamIDs.push(i);

    var replyCallbacks = {}; //TODO: queue requests if no stream IDs are available

    var client; //socket

    this.connect = function(callback) {
        function startup() {
            var builder = new FrameBuilder('STARTUP');
            builder.writeStringMap({
                CQL_VERSION: options.version
                //COMPRESSION: ALGORITHM
            });

            sendStream(builder, function(data) {
                var frame = new FrameParser(data);
                if(frame.opcode == 'READY') {
                    callback();
                } else if (frame.opcode == 'ERROR') {
                    callback(new ProtocolError(frame.readInt(), frame.readString()));
                } else if (frame.opcode == 'AUTHENTICATE') {
                    throw new Error("Server needs authentication which isn't implemented yet"); 
                }
            });
        }

        client = net.connect({ 
            host: host,
            port: port
        }, function() {
            startup();
        });

        client.on('data', handleData);

        client.on('end', function() {
            console.log('end');
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
        frameBuilder.streamID = stream;
        client.write(frameBuilder.build());
    }

    function handleData(data) {
        var stream = data.readUInt8(2);

        var frame = new FrameParser(data);
        
        var callback = replyCallbacks[stream];

        if(callback) {
            streamIDs.push(stream);
            delete replyCallbacks[stream];

            callback(data);
        }
    }
};

function ProtocolError(code, message) {
    this.code = code;
    this.message = message;
}
ProtocolError.prototype = new Error();
ProtocolError.prototype.constructor = ProtocolError;