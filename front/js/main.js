function randomIntFromInterval(min, max) // min and max included
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const map = L.map('mapid', {zoomControl: false}).setView([37.8047488, -122.4214938], 20)
L.tileLayer.provider('HERE.terrainDay', {
    app_id: 'Lw639bgCPrd9dTnBfJsF',
    app_code: 'Lyhc0GQGSkaTQtsa0WxyKw'
}).addTo(map);

let polygons = {};

const putParkingsOnMap = (parkings) => {
    let polygonPoints = parkings['rows'];
    let fillColor;
    let available;
    for (let poly = 0; poly < polygonPoints.length; poly++) {
        let onPolyClick = function (event) {
            const label = event.target.options.label;
            const price = event.target.options.price;
            const available = event.target.options.available;
            if (available) {
                swal({
                    title: 'Parking spot information',
                    text: 'Parking spot number ' + label + ' costs $' + price + ' per/hour.',
                    icon: 'info',
                    buttons: true,
                    dangerMode: false,
                }).then((accepts) => {
                    if (accepts) {
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
        };
        const price = randomIntFromInterval(20, 50);
        let parking = polygonPoints[poly];
        let position = parking['position'].split(',');
        let coords = [];
        for (let i = 0; i < position.length; i += 2) {
            coords.push([parseFloat(position[i + 1]), parseFloat(position[i])])
        }

        const isReserved = parking['reserved'];
        const isInUse = parking['used_from'];

        available = !isReserved & !isInUse;

        if (available) {
            fillColor = 'green'
        } else if (isInUse) {
            fillColor = 'red'
        } else if (isReserved) {
            fillColor = 'orange'
        }

        if (!available) {
            console.log(parking);
        }


        const polygon = L.polygon(coords, {
            fillColor,
            color: fillColor,
            label: parking['id'],
            price: parking['price'],
            available,
        });
        polygon.on('click', onPolyClick);

        let retrieved = polygons[parking['id']];
        if (typeof retrieved !== 'undefined') {
            polygons[parking['id']].removeFrom(map);
            if (available) {
                polygons[parking['id']]['options']['color'] = 'green';
                polygons[parking['id']]['options']['fillColor'] = 'green';
            } else if(isInUse){
                polygons[parking['id']]['options']['color'] = 'red';
                polygons[parking['id']]['options']['fillColor'] = 'red';
            } else {
                polygons[parking['id']]['options']['color'] = 'orange';
                polygons[parking['id']]['options']['fillColor'] = 'orange';
            }
            polygons[parking['id']]['options']['available'] = available;
            polygons[parking['id']].addTo(map);
        } else {
            console.log('Adding');
            polygons[parking['id']] = polygon;
            polygons[parking['id']].addTo(map);
        }
    }
};

const settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://localhost:3002/parkings",
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


