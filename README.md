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

* (constructor)(*<string>*host, *<integer>*port, *<object>* options)
* connect(*<function>* callback) 
* query(*<string>* query, *<function>* callback)
* prepare(*<string>* query, *<function>* callback)
* execute(*<integer>* id, [*<array>* values], [*<integer>* consistency], *<function*> callback)
* disconnect()


Todo
----

* Compression
* Tracing
