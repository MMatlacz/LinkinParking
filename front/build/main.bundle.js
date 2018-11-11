"use strict";

var _eosjs = require("eosjs");

var _eosjs2 = _interopRequireDefault(_eosjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var endpoint = "http://127.0.0.1:8888";
var rpc = new _eosjs2.default(endpoint, { fetch: fetch });

async function checkReservationStatus() {
    var table = await rpc.get_table_rows({
        "json": true,
        "code": "notechainacc", // contract who owns the table
        "scope": "notechainacc", // scope of the table
        "table": "parkstruct", // name of the table as specified by the contract abi
        "limit": 100
    });
    for (var i = 0; i < table.rows.length; i++) {
        var parking = table.rows[i];
        if (parking.id === parking_id && parking.reserved && sensor_status !== reserved) {
            setReservation();
        } else if (parking.id === parking_id && !parking.reserved && sensor_status === reserved) {
            unsetReservation();
        }
    }
}

function randomIntFromInterval(min, max) // min and max included
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var map = L.map('mapid', { zoomControl: false }).setView([37.8047488, -122.4214938], 20);
L.tileLayer.provider('HERE.terrainDay', {
    app_id: 'Lw639bgCPrd9dTnBfJsF',
    app_code: 'Lyhc0GQGSkaTQtsa0WxyKw'
}).addTo(map);

checkReservationStatus().then(function (parkings) {
    console.log(parkings);
    var polygonPoints = parkings['rows'];
    for (var p_idx = 0; p_idx < polygonPoints.length; p_idx++) {
        for (var point_idx = 0; point_idx < polygonPoints[p_idx].length; point_idx++) {
            var lng = polygonPoints[p_idx][point_idx][1];
            polygonPoints[p_idx][point_idx][1] = polygonPoints[p_idx][point_idx][0];
            polygonPoints[p_idx][point_idx][0] = lng;
        }
    }

    for (var poly = 0; poly < polygonPoints.length; poly++) {
        if (poly === 2) {
            fillColor = 'red';
            available = false;
        } else {
            fillColor = 'green';
            available = true;
        }
        var onPolyClick = function onPolyClick(event) {
            var label = event.target.options.label;
            var price = event.target.options.price;
            var available = event.target.options.available;
            if (available) {
                swal({
                    title: 'Parking spot information',
                    text: 'Parking spot number ' + label + ' costs $' + price + ' per/hour.',
                    icon: 'info',
                    buttons: true,
                    dangerMode: false
                }).then(function (accepts) {
                    if (accepts) {
                        swal('The spot is all yours!', {
                            icon: 'success'
                        });
                    }
                });
            } else {
                swal({
                    title: 'Parking spot information',
                    text: 'Parking spot number ' + label + ' is not open',
                    icon: 'warning',
                    button: {
                        text: 'Close'
                    },
                    dangerMode: false
                });
            }
        };
        var price = randomIntFromInterval(20, 50);
        var parking = polygonPoints[poly];
        var position = parking['position'].split(',');
        var coords = [];
        for (var i = 0; i < position.length / 2; i += 2) {
            coords.add([parseFloat(position[i + 1]), parseFloat(position[i])]);
        }
        var polygon = L.polygon(coords, {
            fillColor: fillColor,
            color: fillColor,
            label: parking['id'],
            price: price,
            available: available
        });
        polygon.on('click', onPolyClick);
        polygon.addTo(map);
        polygon.bindTooltip('$' + price, { permanent: true, direction: 'center' }).openTooltip();
    }
});

var lastZoom = void 0;
var tooltipThreshold = 19;
map.on('zoomend', function () {
    var zoom = map.getZoom();
    if (zoom < tooltipThreshold && (!lastZoom || lastZoom >= tooltipThreshold)) {
        $('.leaflet-tooltip').css('display', 'none');
    } else if (zoom >= tooltipThreshold && (!lastZoom || lastZoom < tooltipThreshold)) {
        $('.leaflet-tooltip').css('display', 'block');
    }
    lastZoom = zoom;
});
