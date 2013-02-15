var Void = 0x0001;
var Rows = 0x0002;
var Set_keyspace = 0x0003;
var Prepared = 0x0004;
var Schema_change = 0x0005;

function BodyParser(buf) {
    var offset = 0;

    this.readInt = function() {
        var result = buf.readInt32BE(offset);
        offset += 4;
        return result;
    };
    
    this.readShort = function() {
        var result = buf.readUInt16BE(offset);
        offset += 2;
        return result;
    };

    this.readByte = function() {
        var result = buf.readUInt8(offset);
        offset += 1;
        return result;
    };

    this.readString = function() {
        var length = this.readShort();
        var result = buf.toString('utf8', offset, length);
        offset += length;
        return result;
    };

    function readStringL(buf) {
        var length = this.readInt();
        var result = buf.toString('utf8', offset, length);
        offset += length;
        return result;
    }

    function readUUID(buf) {
        var octets = [];
        for(var i = 0; i < 16; i++) {
            octets.push(this.readByte());
        }

        var str = "";

        octets.forEach(function(octet) {
            str += octet.toString(16);
        });

        return str.slice(0, 8) + '-' + str.slice(8, 12) + '-' + str.slice(12, 16) + '-' + str.slice(16, 20) + '-' + str.slice(20);
    }

    function readStringList(buf) {
        var num = this.readShort();

        var list = [];

        for(var i = 0; i < num; i++) {
            list.push(this.readString());
        }

        return list;
    }

    function readBytes(buf) {
        var num = this.readInt();
        if(num < 0)
            return null;

        var bytes = [];
        for(var i = 0; i < num; i++) {
            bytes.push(this.readByte());
        }

        return bytes;
    }

    function readShortBytes(buf) {
        var num = this.readShort();
        if(num < 0)
            return null;
        var bytes = [];
        for(var i = 0; i < num; i++) {
            bytes.push(this.readByte());
        }
        return bytes;
    }

    /* returns an array with two elements */
    function readOption(buf) {
        var id = this.readShort();
        //var value = this.read
        //TODO
    }

    /* returns an array of arrays */
    function readOptionList(buf) {
        var num = this.readShort();
        var options = [];
        for(var i = 0; i < num; i++) {
            options.push(this.readOption());
        }
        return options;
    }

    function readInet(buf) {

    }

    function readConsistency(buf) {
        return this.readShort();
    }

    function readStringMap(buf) {
        var num = this.readShort();
        var map = {};
        for(var i = 0; i < num; i++) {
            var key = this.readString();
            var value = this.readString();
            map[key] = value;
        }
        return map;
    }

    function readStringMultimap(buf) {
        var num = this.readShort();
        var map = {};
        for(var i = 0; i < num; i++) {
            var key = this.readString();
            var value = this.readStringList();
            map[key] = value;
        }
        return map;
    }    
}



exports.ParseFrame = function(buffer) {
    var request = !!(buffer[0] & 0x80);
    var version = buffer[0] & 0x7F;
    var stream = buffer[2];

    var parser = new BodyParser(buffer);

    switch(buffer[3]) {
    case 0x00: 
        this.op = "ERROR";
        parseError();
        break;
    case 0x01: 
        this.op = "STARTUP";
        break;
    case 0x02: 
        this.op = "READY";
        break;
    case 0x03: 
        this.op = "AUTHENTICATE";
        parseAuthenticate();
        break;
    case 0x04: 
        this.op = "CREDENTIALS";
        break;
    case 0x05: 
        this.op = "OPTIONS";
        break;
    case 0x06: 
        this.op = "SUPPORTED";
        break;
    case 0x07: 
        this.op = "QUERY";
        break;
    case 0x08: 
        this.op = "RESULT";
        break;
    case 0x09: 
        this.op = "PREPARE";
        break;
    case 0x0A: 
        this.op = "EXECUTE";
        break;
    case 0x0B: 
        this.op = "REGISTER";
        break;
    case 0x0C: 
        this.op = "EVENT";
        break;
    default:
        throw new Error('Unrecognized opcode: ' + buffer[3]);
    }

    function parseError() {
        this.error = {};
        this.error.code = parser.readInt();
        this.error.message = parser.readString();

        switch(this.error.code) {
        case 0x1000:
            this.error.cl = parser.readConsistency();
            this.error.required = parser.readInt();
            this.error.alive = parser.readInt();
            break;
        case 0x1100:
            
        }
    };

    function parseAuthenticate() {
        this.authenticator = parser.readString();
    };

    function parseSupported() {
        this.supported = parser.readMultiMap();
    };


    function parseResult() {
        var kind = parser.readInt();

        this.result = {};

        switch(this.kind.result) {
        case 0x0001:
            this.result.kind = 'void';
            break;
        case 0x0002:
            this.result.kind = 'rows';
            
            break;
        case 0x0003:
            this.result.kind = 'set_keyspace';
            this.result.keyspace = parser.readString();
            break;
        case 0x0004:
            this.result.kind = 'prepared';
            break;
        case 0x0005:
            this.result.kind = 'schema_change';
            this.result.change = parser.readString();
            this.result.keyspace = parser.readString();
            this.result.table = parser.readString();
            break;
        }
    };
};