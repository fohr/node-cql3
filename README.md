node-cq3
========

A driver for Cassandra's CQ3 binary protocol.

API
---

    var Client = require('cql3').Client;
    
    var client = new Client('localhost', 9130);
    client.connect(function(err) {
        if(!err) {
            init();
        }
    });
    
    function init() {
        client.query('USE test', function(err, result) {
            if(!err) {
                console.log(result);
            }
        });
    }
    
    ---------------------
    
    'test'

Todo
----

* Compression
* Tracing
