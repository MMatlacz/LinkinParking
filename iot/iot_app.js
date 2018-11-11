const Readline = require('@serialport/parser-readline');
const SerialPort = require('serialport');
const axios = require('axios');


var device_id = 1;

var occupied = 'OCCUPIED';
var free = 'FREE';
var reserved = 'RESERVED';
var sensor_status = free;

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
    if (!sending){
        sending = true;
        axios.default.post(
            'http://127.0.0.1:3000/take',
            {'device_id': device_id}
        ).then(function (response) {
            sending = false;
            sensor_status = occupied;
            console.log('Taken place');
        }).catch(function (error) {sending = false; console.log(error);});
    }
}

function fried(device_id) {
    // server is checking if place can be taken
    if (!sending){
        sending = true;
        axios.post('http://127.0.0.1:3000/free', {'device_id': device_id})
            .then(function (response) {
                sending = false;
                sensor_status = free;
                console.log('Fried place')
            })
            .catch(function (error) {sending = false; console.log(error);});
    }
}


var state_machine = {
    [state_key(free, occupied)]: taken,
    [state_key(occupied, free)]: fried,
    [state_key(reserved, occupied)]: taken,
};


var serial_port = new SerialPort('/dev/tty.usbmodem00_01', {
  baudRate: 57600
});
const parser = new Readline();
serial_port.pipe(parser);

parser.on('data', function (data) {
    console.log(data);
    data = data.trim();
    let new_status = status_mapping[data];
    if (new_status !== sensor_status){
        let state_change_fun = state_machine[state_key(sensor_status, new_status)];
        state_change_fun(device_id)
    }
});
