exports.ERROR = 0x00;
exports.STARTUP = 0x01;
exports.READY = 0x02;
exports.AUTHENTICATE = 0x03;
exports.CREDENTIALS = 0x04;
exports.OPTIONS = 0x05;
exports.SUPPORTED = 0x06;
exports.QUERY = 0x07;
exports.RESULT = 0x08;
exports.PREPARE = 0x09;
exports.EXECUTE = 0x0A;
exports.REGISTER = 0x0B;
exports.EVENT = 0x0C;
exports.Void = 0x0001;
exports.Rows = 0x0002;
exports.Set_keyspace = 0x0003;
exports.Prepared = 0x0004;
exports.Schema_change = 0x0005;

exports.toByte = function(num) {
    return new Buffer([num]);
};

exports.toInt = function(num) {
    var buf = new Buffer(4);
    buf.writeInt32BE(num, 0);
    return buf;
};

exports.toUInt = function(num) {
    var buf = new Buffer(4);
    buf.writeUInt32BE(num, 0);
    return buf;
};

exports.toShort = function(num) {
    var buf = new Buffer(2);
    buf.writeUInt16BE(num, 0);
    return buf;
};

exports.toString = function(str) {
    var len = Buffer.byteLength(str, 'utf8');
    var buf = new Buffer(2 + len);
    buf.writeUInt16BE(len, 0);
    buf.write(str, 2, buf.length-2, 'utf8');
    return buf;
};

exports.toLString = function(str) {
    var len = Buffer.byteLength(str, 'utf8');
    var buf = new Buffer(4 + len);
    buf.writeInt32BE(len);
    buf.write(str, 4, buf.length-4, 'utf8');
    return buf;
};

/* uuid() */

exports.toStrList = function(strings) {
    var bufs = [];
    bufs.push(toShort(strings.length));

    strings.forEach(function(str) {
        bufs.push(toString(str));
    });


    return Buffer.concat(bufs);
};

exports.toBytes = function(bytes) {
    if(bytes == null) {
        return toInt(-1);
    } else {
        var bufs = [];
        bufs.push(toInt(bytes.length));

        bytes.forEach(function(b) {
            bufs.push(toByte(b));
        });


        return Buffer.concat(bufs);
    }
};

exports.toStringMap = function(map) {
    var bufs = [];
    for(var key in map) {
        var value = map[key];
        bufs.push(toString(key));
        bufs.push(toString(value));
    }

    bufs.splice(0, 0, toShort(bufs.length));

    return Buffer.concat(bufs);
};

exports.toInet = function(ip, port) {
    /* regex */
};

exports.Frame = function(opcode, body, stream) {
    this.opcode = opcode; /* a number */

    if(body instanceof Array)
        this.body = Buffer.concat(body);
    else /* a buffer */
        this.body = body; 

    if(stream != null)
        this.stream = stream; /* a number */
    else 
        this.stream = 0;

    this.toBuffer = function() {
        return Buffer.concat([ exports.toByte(0x01), 
                               exports.toByte(0), 
                               exports.toByte(stream), 
                               exports.toByte(opcode), 
                               exports.toUInt(this.body.length),
                               body
                             ]);
    };
};