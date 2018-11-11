const express = require('express');
const axios = require('axios');
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
        device_address: 'http://localhost:3001',
        position: {}
    },
    2: {
        status: occupied,
        device_address: null,
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

    if (spot.status === reserved) {
        // TODO: Check if correct user took the place
        spot.status = occupied;
        res.send('OK')
    }

});
app.post('/reserve', function (req, res) {
    console.log('Incoming reserve request');
    let spot_id = req.body['device_id'];
    let spot = db.parking_spots[spot_id];

    if (spot.status === free) {
        spot.status = reserved;
        axios.post(spot.device_address + '/reserve').then(function (response) {
            console.log('Reserved place');
            res.send('OK')
        }).catch(function (error) {console.log(error.toString());});
    }
    else {
        res.statusMessage = "Parking park cannot be reserved";
        res.status(400).end()
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

app.listen(port, () => console.log(`Backend app listening on port ${port}!`));

// const defaultPrivateKey = "5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr"; // useraaaaaaaa
// const signatureProvider = new eosjs.JsSignatureProvider([defaultPrivateKey]);
//
// const rpc = new eosjs.JsonRpc('http://127.0.0.1:8000', { fetch });
// const api = new eosjs.Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
