var net = require('net');

exports.Client = function(host, port, options) {

    var streamIDs = [];
    for(var i = 0; i < 128; i++)
        streamIDs.push(i);

    var streamCallbacks = {};

    this.connect = function(callback) {

    };

    this.query = function(query, callback) {

    };

    this.prepare = function(query, callback) {

    };


    this.execute = function(id, values, consistency, callback) {

    };

    this.disconnect = function() {

    };
};