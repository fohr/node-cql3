exports.BodyParser = function(buf) {
    /* TODO: something when offset >= buf.length */

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
};
