const polygonPoints = [
  [[-122.4205229, 37.8049157],
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
  ],
]


const map = L.map('mapid', {zoomControl: false}).setView([37.8047488, -122.4214938], 20)
L.tileLayer.provider('HERE.terrainDay', {
  app_id: 'Lw639bgCPrd9dTnBfJsF',
  app_code: 'Lyhc0GQGSkaTQtsa0WxyKw'
}).addTo(map)

for (let p_idx = 0; p_idx < polygonPoints.length; p_idx++) {
  for (let point_idx = 0; point_idx < polygonPoints[p_idx].length; point_idx++) {
    let lng = polygonPoints[p_idx][point_idx][1]
    polygonPoints[p_idx][point_idx][1] = polygonPoints[p_idx][point_idx][0]
    polygonPoints[p_idx][point_idx][0] = lng
  }
}

function randomIntFromInterval(min,max) // min and max included
{
  return Math.floor(Math.random()*(max-min+1)+min);
}

for (let poly = 0; poly < polygonPoints.length; poly++) {
  if (poly === 2) {
    fillColor = 'red'
    available = false
  } else {
    fillColor = 'green'
    available = true
  }
  let onPolyClick = function (event) {
    const label = event.target.options.label
    const price = event.target.options.price
    const available = event.target.options.available
    if (available) {
      swal({
        title: 'Parking spot information',
        text: 'Parking spot number ' + label + ' costs $' + price + ' per/hour.',
        icon: 'info',
        buttons: true,
        dangerMode: false,
      })
        .then((accepts) => {
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
  }
  const price = randomIntFromInterval(20, 50)
  const polygon = L.polygon(polygonPoints[poly], {
    fillColor,
    color: fillColor,
    label: poly,
    price: price,
    available,
  })
  polygon.on('click', onPolyClick)
  polygon.addTo(map)
  polygon.bindTooltip('$' + price,
    {permanent: true, direction: 'center'}
  ).openTooltip()
  console.log(polygon)
}
let lastZoom
const tooltipThreshold = 19
map.on('zoomend', function () {
  const zoom = map.getZoom()
  if (zoom < tooltipThreshold && (!lastZoom || lastZoom >= tooltipThreshold)) {
    $('.leaflet-tooltip').css('display', 'none')
  } else if (zoom >= tooltipThreshold && (!lastZoom || lastZoom < tooltipThreshold)) {
    $('.leaflet-tooltip').css('display', 'block')
  }
  lastZoom = zoom
})