// -----------------------------
// Initialize Map
// -----------------------------
var map = L.map('map').setView([22.5, 78.9], 5);

// OSM
var osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '&copy; OpenStreetMap contributors' }
).addTo(map);

// -----------------------------
// ESA WorldCover (NEW MapID)
// -----------------------------
var lulcLayer = L.tileLayer(
  'https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/954125bc301a92b28b1410109bece3ad-eba78f2bca909ad1cc5257fc92500a5a/tiles/{z}/{x}/{y}'
).addTo(map);

// -----------------------------
// Class Dictionary
// -----------------------------
var classDict = {
  10: 'Tree cover',
  20: 'Shrubland',
  30: 'Grassland',
  40: 'Cropland',
  50: 'Built-up',
  60: 'Bare / sparse',
  70: 'Snow & ice',
  80: 'Permanent water',
  90: 'Herbaceous wetland',
  95: 'Mangroves',
  100: 'Moss & lichen'
};

// -----------------------------
// Load SDG GeoJSON (FIXED PATH)
// -----------------------------
fetch('data/India_SDG15_LULC_FINAL.geojson')
  .then(res => res.json())
  .then(data => {
    var props = data.features[0].properties;
    var groups = props.groups;   // ✅ FIX
    showStats(groups);
  })
  .catch(err => {
    console.error(err);
    document.getElementById('statsBox').innerHTML =
      '⚠ Failed to load SDG statistics';
  });

// -----------------------------
// Display Stats
// -----------------------------
function showStats(groups) {

  var html = '<b>Land Cover Statistics (km²)</b><br><br>';

  groups.forEach(function (g) {
    var area_km2 = (g.sum / 1e6).toFixed(2);
    html += classDict[g.class] + ': ' + area_km2 + '<br>';
  });

  document.getElementById('statsBox').innerHTML = html;
}

// -----------------------------
// Layer Control
// -----------------------------
L.control.layers(
  { "OpenStreetMap": osm },
  { "ESA WorldCover": lulcLayer }
).addTo(map);

// -----------------------------
// ESA WorldCover Legend
// -----------------------------
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML += '<b>ESA WorldCover (2021)</b><br>';

  var classes = [
    { name: 'Tree cover', color: '#006400' },
    { name: 'Shrubland', color: '#ffbb22' },
    { name: 'Grassland', color: '#ffff4c' },
    { name: 'Cropland', color: '#f096ff' },
    { name: 'Built-up', color: '#fa0000' },
    { name: 'Bare / sparse', color: '#b4b4b4' },
    { name: 'Snow & ice', color: '#f0f0f0' },
    { name: 'Permanent water', color: '#0064c8' },
    { name: 'Herbaceous wetland', color: '#0096a0' },
    { name: 'Mangroves', color: '#00cf75' },
    { name: 'Moss & lichen', color: '#fae6a0' }
  ];

  classes.forEach(function (item) {
    div.innerHTML +=
      '<i style="background:' + item.color + '"></i> ' +
      item.name + '<br>';
  });

  return div;
};

// -----------------------------
// Toggle legend with ESA layer
// -----------------------------

// Show legend when ESA layer is added
map.on('overlayadd', function (eventLayer) {
  if (eventLayer.layer === lulcLayer) {
    legend.addTo(map);
  }
});

// Hide legend when ESA layer is removed
map.on('overlayremove', function (eventLayer) {
  if (eventLayer.layer === lulcLayer) {
    map.removeControl(legend);
  }
});

