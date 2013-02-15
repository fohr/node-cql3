exports.convert = function (bytes, type) {
    switch(type[0]) {
    case 0x0000: //Custom: the value is a [string], see above.
        return bytes.toString('utf8', 1); //is this right?

    case 0x0001: //Ascii
        return bytes.toString('ascii');

    case 0x0002: //Bigint
        break; //TODO

    case 0x0003: //Blob
        return bytes;

    case 0x0004: //Boolean
        return !!bytes.readUInt8(0); //is this correct on all systems?

    case 0x0005: //Counter
        break; //TODO

    case 0x0006: //Decimal
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
        break; //TODO

    case 0x000C: //Uuid
        break; //TODO

    case 0x000D: //Varchar
        return bytes.toString('utf8');

    case 0x000E: //Varint
        break;

    case 0x000F: //Timeuuid
        break; //TODO

    case 0x0010: //Inet
        break; //TODO

    case 0x0020: //List: the value is an [option], representing the type of the elements of the list.
    case 0x0021: //Map: the value is two [option], representing the types of the keys and values of the map
    case 0x0022: //Set: the value is an [option], representing the type of the elements of the set
        break; //TODO
    }

    throw new Error('Unknown data type: ' + type[0]);
};