const Readline = require('@serialport/parser-readline');
const SerialPort = require('serialport');

const { Api, JsonRpc, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');                            // node only; not needed in browsers
const { TextDecoder, TextEncoder } = require('text-encoding');

// Id of the device will be automatically generated
const parking_id = 0;

const occupied = 'OCCUPIED';
const free = 'FREE';
const reserved = 'RESERVED';
let sensor_status = free;

const status_mapping = {
    '1': occupied,
    '0': free,
    '2': reserved
};

const endpoint = "http://127.0.0.1:8888";
let account = 'useraaaaaaac';
let privateKey = '5K2jun7wohStgiCDSDYjk3eteRH1KaxUQsZTEmTGPH4GS9vVFb7';

const rpc = new JsonRpc(endpoint, { fetch });
const signatureProvider = new JsSignatureProvider([privateKey]);
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

let actionData = {};

function state_key(from, to){
    return from + '->' + to
}

async function takeParking(parking_id, account) {
	let actionName = "take";
	actionData = {
		user: 		account,
		id:			parking_id
	};
	console.log(actionData);

	let result = await api.transact({
		actions: [{
		  account: "parkchainacc",
		  name: actionName,
		  authorization: [{
			actor: account,
			permission: 'active',
		  }],
		  data: actionData,
		}]
		}, {
		blocksBehind: 3,
		expireSeconds: 30,
	});

	console.log(result);
}

async function releaseParking(parking_id, account) {
	let actionName = "release";
	actionData = {
		user: 		account,
		id:			parking_id
	};
	console.log(actionData);

	let result = await api.transact({
		actions: [{
		  account: "parkchainacc",
		  name: actionName,
		  authorization: [{
			actor: account,
			permission: 'active',
		  }],
		  data: actionData,
		}]
		}, {
		blocksBehind: 3,
		expireSeconds: 30,
	});

	console.log(result);
}


const state_machine = {
    [state_key(free, occupied)]: takeParking,
    [state_key(occupied, free)]: releaseParking,
    [state_key(reserved, occupied)]: takeParking,
    [state_key(free, reserved)]: console.log,
};


const serial_port = new SerialPort('/dev/tty.usbmodem00_01', {
    baudRate: 2 * 57600
});
const parser = new Readline();
serial_port.pipe(parser);

parser.on('data', function (data) {
    // console.info(data);
    data = data.trim();
    let new_status = status_mapping[data];

    if (new_status !== sensor_status){
        let state_change_fun = state_machine[state_key(sensor_status, new_status)];
        state_change_fun(parking_id, account);
        sensor_status = new_status;
    }
});

async function checkReservationStatus() {
	let table = await rpc.get_table_rows({
      "json": true,
      "code": "parkchainacc",   // contract who owns the table
      "scope": "parkchainacc",  // scope of the table
      "table": "parkstruct",    // name of the table as specified by the contract abi
      "limit": 100,
    });
	for (let i=0; i < table.rows.length; i++){
		let parking = table.rows[i];
		if (parking.id === parking_id && parking.reserved && sensor_status !== reserved){
			setReservation()
		}
		else if (parking.id === parking_id && !parking.reserved && sensor_status === reserved) {
			unsetReservation()
		}
	}
}

function setReservation(){
	serial_port.write('reserve', function(err) {
      if (err)
      	return console.error('Error on write: ', err.message);
      console.info('message written');
    });
}

function unsetReservation(){
	serial_port.write('0', function(err) {
      if (err)
      	return console.error('Error on write: ', err.message);
      console.info('message written');
    });
}

setInterval(checkReservationStatus,1000);
