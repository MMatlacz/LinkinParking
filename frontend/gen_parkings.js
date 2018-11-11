#!/usr/bin/env node


const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');                            // node only; not needed in browsers
const { TextDecoder, TextEncoder } = require('text-encoding');  // node, IE11 and IE Edge Browsers

const endpoint = "http://127.0.0.1:8888";

console.log('Adding parkings');
let account = 'useraaaaaaac';
let privateKey = '5K2jun7wohStgiCDSDYjk3eteRH1KaxUQsZTEmTGPH4GS9vVFb7';
let parkings = [
[
  [-122.4205229, 37.8049157],
  [-122.4205403, 37.8049147],
  [-122.4205309, 37.8048765],
  [-122.4205095, 37.8048797],
],
[
  [-122.4205457, 37.804912],
  [-122.4205651, 37.8049094],
  [-122.4205551, 37.804876],
  [-122.4205363, 37.8048781],
],
[
  [-122.4213047, 37.8047934],
  [-122.4213316, 37.8047891],
  [-122.4213222, 37.8047457],
  [-122.4212873, 37.8047499],
],
[
  [-122.4215488, 37.8049671],
  [-122.4215823, 37.8049682],
  [-122.4215716, 37.8049226],
  [-122.4215341, 37.8049279],
],
[
  [-122.4215274, 37.8048326],
  [-122.4215522, 37.8048294],
  [-122.4215448, 37.8047918],
  [-122.4215186, 37.8047939],
],
[
  [-122.4222308, 37.8055563],
  [-122.4222831, 37.8055457],
  [-122.4222797, 37.8055314],
  [-122.4222227, 37.8055377]
],
[
  [-122.4223045, 37.8055457],
  [-122.4223568, 37.8055409],
  [-122.4223541, 37.8055245],
  [-122.4222998, 37.8055314]
],
[
  [-122.4224339, 37.8055287],
  [-122.422501, 37.8055208],
  [-122.4224976, 37.8055022],
  [-122.4224326, 37.8055123]
],
[
  [-122.4210928, 37.8056008],
  [-122.4211653, 37.8055976],
  [-122.4211586, 37.8055764],
  [-122.4210928, 37.8055806]
],
[
  [-122.4211867, 37.805587],
  [-122.4212578, 37.8055849],
  [-122.4212538, 37.8055637],
  [-122.4211827, 37.8055711]
],
[
  [-122.4207911, 37.8057544],
  [-122.4208528, 37.805747],
  [-122.4208488, 37.8057375],
  [-122.4207857, 37.8057385]
],
[
  [-122.4208568, 37.8057502],
  [-122.4209145, 37.8057396],
  [-122.4209104, 37.8057279],
  [-122.4208568, 37.8057332]
],
[
  [-122.4209239, 37.8057385],
  [-122.4209762, 37.8057332],
  [-122.4209721, 37.8057141],
  [-122.4209185, 37.8057216]
],
[
  [-122.4207415, 37.8057608],
  [-122.4207804, 37.8057555],
  [-122.420779, 37.8057438],
  [-122.4207374, 37.8057459]
],
[
  [-122.4206436, 37.8057756],
  [-122.4207173, 37.805765],
  [-122.420712, 37.8057502],
  [-122.4206395, 37.8057555]
],
[
  [-122.4205805, 37.8057851],
  [-122.4206315, 37.8057777],
  [-122.4206302, 37.8057565],
  [-122.4205698, 37.8057639]
]];

const rpc = new JsonRpc(endpoint, { fetch });
const signatureProvider = new JsSignatureProvider([privateKey]);
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

// prepare variables for the switch below to send transactions
let actionName = "";
let actionData = {};

// define actionName and action according to event type
async function addParking(latlng, price) {
	let actionName = "add";
	var latlng_str = '';
	for(var i in latlng)
		latlng_str += latlng[i][0] + "," + latlng[i][1] + ",";
	latlng_str = latlng_str.substring(0, latlng_str.length - 1);
	actionData = {
		user: 		account,
		position:	latlng_str,
		price:		price
	};
	console.log(actionData);

	let result = await api.transact({
		actions: [{
		  account: "notechainacc",
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

async function takeParking(parking_id) {
	let actionName = "take";
	actionData = {
		user: 		account,
		id:			parking_id
	};
	console.log(actionData);

	let result = await api.transact({
		actions: [{
		  account: "notechainacc",
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

async function releaseParking(parking_id) {
	let actionName = "release";
	actionData = {
		user: 		account,
		id:			parking_id
	};
	console.log(actionData);

	let result = await api.transact({
		actions: [{
		  account: "notechainacc",
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

async function getParkings() {
	console.log('sgit');
	let result2 = await rpc.get_table_rows({
      "json": true,
      "code": "notechainacc",   // contract who owns the table
      "scope": "notechainacc",  // scope of the table
      "table": "parkstruct",    // name of the table as specified by the contract abi
      "limit": 100,
    });
	console.log(result2);
	return result2.rows;
}

function addAllParkings() {
	for(var p in parkings) {
		addParking(parkings[p], 1);
	}
}

// addAllParkings();
// addParking(parkings[0], 1);
// takeParking(2)
// releaseParking(1)
getParkings();