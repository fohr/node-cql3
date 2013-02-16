var Client = require('../index').Client;

var client = new Client('localhost');

client.connect(function(err) {
    if(err) {
        console.log(err);
        client.disconnect();
    } else {
        client.prepare("SELECT * from system.schema_keyspaces;", function(err, id, meta) {
            if(err) {
                console.log(err); 
            } else {
                console.log('execute');
                client.execute(id, [], function(err, result) {
                    if(err)
                        console.log(err);
                    else
                        console.log(result);
                });
            }
        });
    }
});

