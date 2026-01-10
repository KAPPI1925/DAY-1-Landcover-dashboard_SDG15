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
  'https://earthengine.googleapis.com/map/954125bc301a92b28b1410109bece3ad-3db5a26ca2257aff46dd7c9c51953d8b/{z}/{x}/{y}?token='
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
