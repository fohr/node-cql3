Description
===========

A driver for Cassandra's CQ3 binary protocol. It doesn't provide high-level client functionality like abstracted queries, multiple server connections, etc. That functionality can be built on top of this module easily, however.

API
===

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

* (constructor)( _&lt;string&gt;_ host, _&lt;integer&gt;_ port, _&lt;object&gt;_ options)
* connect( _&lt;function&gt;_ callback) 
* query( _&lt;string&gt;_ query, _&lt;function&gt;_ callback) - send a CQL3 query to the server
  * __callback__ has the form _(err, result)_ where the format of result depends on the query (see below).
* prepare( _&lt;string&gt;_ query, _&lt;function&gt;_ callback)
* execute( _&lt;integer&gt;_ id, [ _&lt;array&gt;_ values], [ _&lt;integer&gt;_ consistency], _&lt;function&gt;_ callback)
   * consistency can be one of these options:
      * 0 - ANY
      * 1 - ONE
      * 2 - TWO
      * 3 - THREE
      * 4 - QUORUM
      * 5 - ALL
      * 6 - LOCAL_QUORUM
      * 7 - EACH_QUORUM
    
* disconnect()


Todo
----

* Compression
* Tracing
