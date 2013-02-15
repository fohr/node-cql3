//Note: only good for building request frames
exports.FrameBuilder = function() {
    var buffers = [];

    this.writeShort = function(num) {
        var buf = new Buffer(2);
        buf.writeUInt16BE(num, 0);
        buffers.push(buf);
    };

    this.writeInt = function(num) {
        var buf = new Buffer(4);
        buf.writeInt32BE(num, 0);
        buffers.push(buf);
    };

    this.writeBytes = function(bytes) {
        if(bytes == null) {
            this.writeInt(-1);
        } else {
            this.writeInt(bytes.length);

            buffers.push(new Buffer(bytes));
        }
    };

    this.writeShortBytes = function(bytes) {
        if(bytes == null) {
            this.writeShort(-1);
        } else {
            this.writeShort(bytes.length);

            buffers.push(new Buffer(bytes));
        }
    };

    this.writeString = function(str) {
        var len = Buffer.byteLength(str, 'utf8');
        var buf = new Buffer(2 + len);
        buf.writeUInt16BE(len, 0);
        buf.write(str, 2, buf.length-2, 'utf8');
        buffers.push(buf);
    };

    this.writeLString = function(str) {
        var len = Buffer.byteLength(str, 'utf8');
        var buf = new Buffer(4 + len);
        buf.writeInt32BE(len);
        buf.write(str, 4, buf.length-4, 'utf8');
        buffers.push(buf);
    };

    this.writeStringList = function(strings) {
        var bufs = [];

        this.writeShort(strings.length);

        strings.forEach(function(str) {
            this.writeString(str);
        });
    };

    this.writeStringMap = function(map) {
        var num = 0;
        for(var i in map) {
            num++;
        }

        this.writeShort(num);

        var bufs = [];
        for(var key in map) {
            this.writeString(key);
            this.writeString(map[key]);
        }
    };

    function buildFrame(opcode, streamID) {
        var body = Buffer.concat(buffers);
        var head = new Buffer([OPCODES[opcode], 
                               0x01, //protocol version 1
                               0, // no flags currently supported
                               streamID]);

        var length = new Buffer(4);
        length.writeUInt32BE(body.length);

        return Buffer.concat([head, length, body]);
    };
};

var OPCODES = {
    ERROR: 0x00,
    STARTUP: 0x01,
    READY: 0x02,
    AUTHENTICATE: 0x03,
    CREDENTIALS: 0x04,
    OPTIONS: 0x05,
    SUPPORTED: 0x06,
    QUERY: 0x07,
    RESULT: 0x08,
    PREPARE: 0x09,
    EXECUTE: 0x0A,
    REGISTER: 0x0B,
    EVENT: 0x0C
};