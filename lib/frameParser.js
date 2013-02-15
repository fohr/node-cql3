exports.FrameParser = function(buf) {
    /* TODO: something when offset >= buf.length */
    this.request = !!(buf[0] & 0x80);
    this.version = buf[0] & 0x7F;
    this.flags = buf[1];
    this.stream = buf[2];
    this.opcode = OPCODES[buf[3]];
    this.bodyLength = buf.readUInt32BE(4);

    var offset = 8;

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
        var result = buf.toString('utf8', offset, offset+length);
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
        /* TODO */
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
        /* TODO */
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

    this.readMetadata = function() {
        var meta = {};
        //as used in Rows and Prepared responses
        var flags = this.readInt();

        var columnCount = this.readInt();

        if(flags & 0x0001) { //global_tables_spec
            meta.global_tables_spec = true;
            meta.keyspace = this.readString();
            meta.table = this.readString();
        }

        meta.columns = [];

        for(var i = 0; i < columnCount; i++) {
            var spec = {};
            if(!meta.global_tables_spec) {
                spec.ksname = this.readString();
                spec.tablename = this.readString();
            }

            spec.column_name = this.readString();
            spec.type = this.readOption();

            meta.columns.push(spec);
        }

        return meta;
    };
};

var OPCODES = {
    0: 'ERROR',
    1: 'STARTUP',
    2: 'READY',
    3: 'AUTHENTICATE',
    4: 'CREDENTIALS',
    5: 'OPTIONS',
    6: 'SUPPORTED',
    7: 'QUERY',
    8: 'RESULT',
    9: 'PREPARE',
    10: 'EXECUTE',
    11: 'REGISTER',
    12: 'EVENT'
};