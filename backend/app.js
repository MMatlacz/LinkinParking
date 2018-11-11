const express = require('express');
const eosjs = require('eosjs');
const fetch = require('node-fetch');
var bodyParser = require('body-parser');

var occupied = 'OCCUPIED';
var free = 'FREE';
var reserved = 'RESERVED';

var app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


let db = {
  parking_spots: {
    1: {
        status: free,
        position: {}
    },
    2: {
        status: occupied,
        position: {}
    }
  }
};

app.get('/status', function (req, res) {
    res.send(JSON.stringify(db.parking_spots))
});
app.post('/take', function(req, res) {
    console.log('Incoming take request');
    let spot_id = req.body['device_id'];
    let spot = db.parking_spots[spot_id];

    if (spot.status === free){
        spot.status = occupied;
        res.send('OK')
    }
});

app.post('/free', function(req, res) {
    console.log('Incoming free request');
    let spot_id = req.body['device_id'];
    let spot = db.parking_spots[spot_id];

    if (spot.status === occupied) {
        spot.status = free;
        res.send('OK')
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// const defaultPrivateKey = "5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr"; // useraaaaaaaa
// const signatureProvider = new eosjs.JsSignatureProvider([defaultPrivateKey]);
//
// const rpc = new eosjs.JsonRpc('http://127.0.0.1:8000', { fetch });
// const api = new eosjs.Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
