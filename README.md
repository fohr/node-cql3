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

* (constructor)(_&lt;string&rt;_host, _&lt;integer&rt;_port, _&lt;object&rt;* options)
* connect(_&lt;function&rt;_ callback) 
* query(_&lt;string&rt;_ query, _&lt;function&rt;_ callback)
* prepare(_&lt;string&rt;_ query, _&lt;function&rt;_ callback)
* execute(_&lt;integer&rt;_ id, [_&lt;array&rt;_ values], [_&lt;integer&rt;_ consistency], _&lt;function&rt;_ callback)
* disconnect()


Todo
----

* Compression
* Tracing
