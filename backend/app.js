const express = require('express');
const axios = require('axios');
const { JsonRpc } = require('eosjs');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors')

const app = express();
const port = 3002;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

const endpoint = "http://127.0.0.1:8888";
const rpc = new JsonRpc(endpoint, { fetch });


app.get('/parkings', function (req, res) {
	rpc.get_table_rows({
      "json": true,
      "code": "parkchainacc",   // contract who owns the table
      "scope": "parkchainacc",  // scope of the table
      "table": "parkstruct",    // name of the table as specified by the contract abi
      "limit": 100,
    }).then(function(data){
        res.json(data)
    });
});


app.listen(port, () => console.log(`Backend app listening on port ${port}!`));
