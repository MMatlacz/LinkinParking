const map = L.map('mapid', {zoomControl: false}).setView([37.8047488, -122.4214938], 20)
L.tileLayer.provider('HERE.terrainDay', {
    app_id: 'Lw639bgCPrd9dTnBfJsF',
    app_code: 'Lyhc0GQGSkaTQtsa0WxyKw'
}).addTo(map);

let parkings = {};

function onParkingClick(event) {
    const label = event.target.options.label;
    const price = event.target.options.price;
    const available = event.target.options.available;
    if (available) {
        swal({
            title: 'Parking spot information',
            text: 'Parking spot number ' + label + ' costs $' + price + ' per/hour.',
            // icon: 'info',
            icon: "../static/logo.png",
            buttons: true,
            dangerMode: false,
        }).then((accepts) => {
            if (accepts) {
                let settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": "http://10.7.0.240:3002/reservation",
                    "method": "POST",
                    "headers": {
                        "content-type": "application/json",
                        "cache-control": "no-cache",
                        "postman-token": "8a1b69db-811f-cdf5-df62-38ad7f31ec36"
                    },
                    "processData": false,
                    "data": "{\n\t\"parkingID\": " + label + "\n}"
                };

                $.ajax(settings).done(function (response) {
                    console.log(response);
                });
                swal('The spot is all yours!', {
                    icon: 'success',
                })
            }
        })
    } else {
        swal({
            title: 'Parking spot information',
            text: 'Parking spot number ' + label + ' is not open',
            icon: 'warning',
            button: {
                text: 'Close',
            },
            dangerMode: false,
        })
    }
}

function addParking(parking) {
    let position = parking['position'].split(',');
    let coords = [];
    for (let i = 0; i < position.length; i += 2) {
        coords.push([parseFloat(position[i + 1]), parseFloat(position[i])])
    }

    const isReserved = parking['reserved'];
    const isInUse = parking['used_from'];

    let available = !isReserved & !isInUse;

    let fillColor = 'green';
    if (isInUse) {
        fillColor = 'red';
    } else if (isReserved) {
        fillColor = 'orange';
    }

    if (!available) {
        console.log(parking);
    }


    const polygon = L.polygon(coords, {
        fillColor,
        color: fillColor,
        label: parking['id'],
        price: parseInt(parking['price']),
        available,
    });
    polygon.on('click', onParkingClick);
    polygon['options']['color'] = fillColor;
    polygon['options']['fillColor'] = fillColor;
    polygon.addTo(map);
    parkings[parking['id']] = polygon;
}

function updateParking(parking) {
    const isReserved = parking['reserved'];
    const isInUse = parking['used_from'];

    let available = !isReserved & !isInUse;
    let fillColor = 'green';
    if (isInUse) {
        fillColor = 'red';
    } else if (isReserved) {
        fillColor = 'orange';
    }

    parkings[parking['id']]['options']['color'] = fillColor;
    parkings[parking['id']]['options']['fillColor'] = fillColor;
    parkings[parking['id']]['options']['available'] = available;
    map.removeLayer(parkings[parking['id']]);
    parkings[parking['id']].addTo(map);
}

function putParkingsOnMap(data) {
    let parks = data['rows'];
    for (let i = 0; i < parks.length; i++) {
        let parking_id = parks[i]['id'];
        let retrieved = parkings[parking_id];
        if (retrieved === undefined)
            addParking(parks[i]);
        else
            updateParking(parks[i]);
    }
}

const settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://10.7.0.240:3002/parkings",
    "method": "GET",
    "headers": {
        "cache-control": "no-cache",
        "postman-token": "6f892b45-9214-4f66-f1cb-ab9d319681f7"
    }
};

const checkParkingsStatus = () => {
    $.ajax(settings).done(function (response) {
        putParkingsOnMap(response);
        let lastZoom;
        const tooltipThreshold = 19;
        map.on('zoomend', function () {
            const zoom = map.getZoom();
            if (zoom < tooltipThreshold && (!lastZoom || lastZoom >= tooltipThreshold)) {
                $('.leaflet-tooltip').css('display', 'none')
            } else if (zoom >= tooltipThreshold && (!lastZoom || lastZoom < tooltipThreshold)) {
                $('.leaflet-tooltip').css('display', 'block')
            }
            lastZoom = zoom
        });
    });
};

// checkParkingsStatus()
setInterval(checkParkingsStatus, 1000);


