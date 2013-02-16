exports.convert = function (bytes, type) {
    switch(type[0]) {
    case 0x0000: //Custom: the value is a [string], see above.
        return bytes.toString('utf8', 1); //is this right?

    case 0x0001: //Ascii
        return bytes.toString('ascii');

    case 0x0002: //Bigint
        return bytes.readInt32BE(4); //TODO (64 bit long)

    case 0x0003: //Blob
        return bytes;

    case 0x0004: //Boolean
        return !!bytes.readUInt8(0); //is this correct on all systems?

    case 0x0005: //Counter
        return bytes.readInt32BE(4); //TODO (64 bit long)

    case 0x0006: //Decimal
        throw new Error('Decimal type not implemented in client');
        break; //TODO

    case 0x0007: //Double
        return bytes.readDoubleBE(0);

    case 0x0008: //Float
        return bytes.readFloatBE(0);

    case 0x0009: //Int
        return bytes.readInt32BE(0);

    case 0x000A: //Text
        return bytes.toString('utf8');

    case 0x000B: //Timestamp
        return bytes.readInt32BE(4); //TODO (64 bit long)

    case 0x000C: //Uuid
        return bytes.toString('utf8');

    case 0x000D: //Varchar
        return bytes.toString('utf8');

    case 0x000E: //Varint
        return bytes.readInt32BE(bytes.length-4); //TODO (variable length int)

    case 0x000F: //Timeuuid
        return bytes.toString('utf8');

    case 0x0010: //Inet
        return bytes.toString('utf8');

    case 0x0020: //List: the value is an [option], representing the type of the elements of the list.
    case 0x0021: //Map: the value is two [option], representing the types of the keys and values of the map
    case 0x0022: //Set: the value is an [option], representing the type of the elements of the set
        throw new Error('List/Map/Set types not implemented in client'); //TODO
    }

    throw new Error('Unknown data type: ' + type[0]);
};