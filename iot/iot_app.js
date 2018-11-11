const Readline = require('@serialport/parser-readline');
const SerialPort = require('serialport');
const axios = require('axios');
const express = require('express');

const port = 3001;
var app = express();

var device_id = 1;

var initial = 'INITIAL';
var occupied = 'OCCUPIED';
var free = 'FREE';
var reserved = 'RESERVED';
var sensor_status = initial;

var sending = false;

var status_mapping = {
    '1': occupied,
    '0': free,
    '2': reserved
};


function state_key(from, to){
    return from + '->' + to
}

function taken(device_id) {
    // server is checking if place can be taken
    axios.post(
        'http://127.0.0.1:3000/take',
        {'device_id': device_id}
    ).then(function (response) {
        sending = false;
        console.info('Taken place');
    }).catch(function (error) {sending = false; console.error(error);});

}

function fried(device_id) {
    // server is checking if place can be taken
    axios.post('http://127.0.0.1:3000/free', {'device_id': device_id})
        .then(function (response) {
            sending = false;
            console.info('Fried place')
        })
        .catch(function (error) {sending = false; console.error(error);});

}

function reserve(device_id) {
    console.info('Spot was reserved by backend');
}


var state_machine = {
    [state_key(free, occupied)]: taken,
    [state_key(occupied, free)]: fried,
    [state_key(reserved, occupied)]: taken,
    [state_key(free, reserved)]: reserve,
    [state_key(initial, free)]: fried,
    [state_key(initial, occupied)]: taken,
    [state_key(initial, reserved)]: reserve,
};


var serial_port = new SerialPort('/dev/tty.usbmodem00_01', {
  baudRate: 2*57600
});
const parser = new Readline();
serial_port.pipe(parser);

parser.on('data', function (data) {
    console.info(data);
    data = data.trim();
    let new_status = status_mapping[data];

    if (new_status !== sensor_status){
        let state_change_fun = state_machine[state_key(sensor_status, new_status)];
        state_change_fun(device_id);
        sensor_status = new_status;
    }
});

app.post('/reserve', function(req, res) {
    serial_port.write('reserve', function(err) {
      if (err){
          res.statusMessage = 'Couldn reserv parking spot';
          res.status(400).end();
          console.error('Error on write: ', err.message);
          return
      }

      res.send('OK');
      console.info('message written');
    });
});

app.listen(port, () => console.log(`Iot controller app listening on port ${port}!`));