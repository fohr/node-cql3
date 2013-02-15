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
        client.query('USE test;', function(err, result) {
            if(!err) {
                console.log(result);
            }
        });
    }
    
    ---------------------
    
    'test'
    
#### Client

* (constructor)(_<string>_host, _<integer>_port, _<object>* options)
* connect(_<function>_ callback) 
* query(_<string>_ query, _<function>_ callback)
* prepare(_<string>_ query, _<function>_ callback)
* execute(_<integer>_ id, [_<array>_ values], [_<integer>_ consistency], _<function>_ callback)
* disconnect()


Todo
----

* Compression
* Tracing
