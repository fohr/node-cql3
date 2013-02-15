var net = require('net'),
    events = require('events'),
    util = require('util'),
    FrameParser = require('./lib/frameParser').FrameParser,
    FrameBuilder = require('./lib/frameBuilder').FrameBuilder,
    Types = require('./lib/types.js').Types;

//Default port: 9042
var Client = exports.Client = function(host, port, options) {
    events.EventEmitter.call(this);

    if(options == null) {
        options = port;
        port = 9042;
    }

    if(options == null)
        options = {}; //to avoid null reference exceptions

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
        }, startup);

        client.on('data', handleData);

        client.on('end', function() {
            client = null;
        });
    };

    this.query = function(query, consistency, callback) {
        if(typeof callback == 'undefined') {
            callback = consistency;
            consistency = 1; //ONE, is this a good default?
        }

        var frame = new FrameBuilder('QUERY');
        frame.writeLString(query);
        frame.writeShort(consistency);
        
        sendStream(frame, function(data) {
            var frame = new FrameParser(data);

            if(frame.opcode == 'RESULT') {
                callback(null, parseResult(frame));
            } else if (frame.opcode == 'ERROR') {
                callback(new ProtocolError(frame.readInt(), frame.readString()));
            }
        });
    };

    this.prepare = function(query, callback) {

    };

    //id is a buffer from a PREPARE
    this.execute = function(id, values, consistency, callback) {

    };

    this.register = function(events) { //array of strings

    };

    this.disconnect = function() {
        client.end();
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

    function parseResult(frame) {
        var kind = frame.readInt();

        switch (kind) {
        case 1: //Void
            return null;
        case 2: //Rows
            return parseRows(frame);
        case 3: //Set_keyspace
            return frame.readString();
        case 4: //Prepared
            return {
                id: frame.readShortBytes(),
                metadata: frame.readMetadata()
            };
        case 5: //Schema_change
            //This may need to be fixed to use outside of V8
            return {
                change: frame.readString(),
                keyspace: frame.readString(),
                table: frame.readString()
            };
        }

        return null; //TODO: error handling
    }

    function parseRows(frame) {
        var meta = frame.readMetadata();
        var rowCount = frame.readInt();

        var rows = [];
        for(var i = 0; i < rowCount; i++) {
            var row = {};
            for(var col = 0; col < meta.columns.length; col++ ) {
                var spec = meta.columns[col];
                console.log(spec.type);
                row[spec.column_name] = Types.convert(frame.readBytes(), spec.type);
            }
            rows.push(row);
        }

        return {
            meta: meta,
            rows: rows
        };
    }
};

function ProtocolError(code, message) {
    this.code = code;
    this.message = message;
}
ProtocolError.prototype = new Error();
ProtocolError.prototype.constructor = ProtocolError;

util.inherits(Client, events.EventEmitter);