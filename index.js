var net = require('net'),
    events = require('events'),
    util = require('util'),
    FrameParser = require('./lib/frameParser').FrameParser,
    FrameBuilder = require('./lib/frameBuilder').FrameBuilder,
    types = require('./lib/types.js');

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

    var replyCallbacks = {}; 

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
                    callback(new ProtocolError(frame));
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
                callback(new ProtocolError(frame));
            }
        });
    };

    this.prepare = function(query, callback) {
        var frame = new FrameBuilder('PREPARE');
        frame.writeLString(query);

        sendStream(frame, function(data) {
            var frame = new FrameParser(data);

            if(frame.opcode == 'PREPARED') {
                callback(null, parseResult(frame));
            } else if (frame.opcode == 'ERROR') {
                callback(new ProtocolError(frame));
            }
        });
    };

    //id is a buffer from a PREPARE
    this.execute = function(id, values, consistency, callback) {
        if(typeof callback == 'undefined') {
            callback = consistency;
            consistency = 1; //ONE, is this a good default?
        }

        var frame = new FrameBuilder('EXECUTE');
        frame.writeShortBytes(id);
        frame.writeShort(values.length);

        values.forEach(function(value) {
            frame.writeBytes(value);
        });

        frame.writeShort(consistency);

        sendStream(frame, function(data) {
            var frame = new FrameParser(data);

            if(frame.opcode == 'RESULT') {
                callback(null, parseResult(frame));
            } else if (frame.opcode == 'ERROR') {
                callback(new ProtocolError(frame));
            }
        });
    };

    this.register = function(events, callback) { //array of strings
        var frame = new FrameBuilder('REGISTER');
        frame.writeStringList(events);

        sendStream(frame, function(data) {
            var frame = new FrameParser(data);
            if(frame.opcode == 'READY')
                callback();
            else if(frame.opcode == 'READY')
                callback(new ProtocolError(frame));
        });
    };

    this.disconnect = function(callback) {
        if(callback)
            client.on('end', callback);

        client.end();

        streamIDs = [];
        for(var i = 0; i < 128; i++)
            streamIDs.push(i);

        for(var key in replyCallbacks) {
            delete replyCallbacks[key];
        }
    };

    //send a frame with a new streamID (queuing if necessary) and register a callback
    function sendStream(frameBuilder, callback) {
        if(typeof callback == 'undefined') 
            callback = function() {};

        //TODO: queue requests if no stream IDs are available (and if a callback was passed)
        var stream = streamIDs.pop();
        replyCallbacks[stream] = callback;
        frameBuilder.streamID = stream;
        client.write(frameBuilder.build());
    }

    function handleData(data) {
        var stream = data.readUInt8(2);

        if(stream >= 0) {
            var callback = replyCallbacks[stream];

            if(callback) {
                streamIDs.push(stream);
                delete replyCallbacks[stream];

                callback(data);
            }
        } else {
            //EVENT
            var frame = new FrameParser(data);
            var event = frame.readString();

            if(event == 'TOPOLOGY_CHANGE') {
                this.emit(event, frame.readString(), frame.readInet());
            } else if (event == 'STATUS_CHANGE') {
                this.emit(event, frame.readString(), frame.readInet());
            } else if (event == 'SCHEMA_CHANGE') {
                this.emit(event, frame.readString(), frame.readString(), frame.readString());
            } else {
                throw new Error('Unknown EVENT type: ' + event);
            }
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
                meta: frame.readMetadata()
            };
        case 5: //Schema_change
            return {
                change: frame.readString(),
                keyspace: frame.readString(),
                table: frame.readString()
            };
        }

        throw new Error('Unkown RESPONSE type: ' + kind);
    }

    function parseRows(frame) {
        var meta = frame.readMetadata();
        var rowCount = frame.readInt();

        var rows = [];
        for(var i = 0; i < rowCount; i++) {
            var row = {};
            for(var col = 0; col < meta.columns.length; col++ ) {
                var spec = meta.columns[col];
                row[spec.column_name] = types.convert(frame.readBytes(), spec.type);
            }
            rows.push(row);
        }

        return {
            meta: meta,
            rows: rows
        };
    }
};

function ProtocolError(frame) {
    this.code = frame.readInt();
    this.message = frame.readString();
}
ProtocolError.prototype = new Error();
ProtocolError.prototype.constructor = ProtocolError;

util.inherits(Client, events.EventEmitter);