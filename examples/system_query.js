var Client = require('../index').Client;

var client = new Client('localhost');

client.connect(function(err) {
    if(err) {
        console.log(err);
        client.disconnect();
    } else {
        client.query("SELECT * from system.schema_keyspaces;", function(err, result) {

            if(err)
                console.log(err);
            else
                console.log(result);

            client.disconnect();
        });
    }
});

