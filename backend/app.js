const Readline = require('@serialport/parser-readline');
var SerialPort = require('serialport');
var serial_port = new SerialPort('/dev/tty.usbmodem00_01', {
  baudRate: 57600
});
const parser = new Readline();
serial_port.pipe(parser);
parser.on('data', function (data) {
    last_message = data
});


var last_message = null;

const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(JSON.stringify({'last_message': last_message}));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});