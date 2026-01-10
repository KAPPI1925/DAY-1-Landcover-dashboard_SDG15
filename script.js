// Global object to store percentage values
var lulcPercent = {};



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
    var groups = props.groups;

    // Compute total area
    var totalArea = 0;
    groups.forEach(g => totalArea += g.sum);

    // Compute percentage per class
    groups.forEach(function (g) {
      lulcPercent[g.class] = ((g.sum / totalArea) * 100).toFixed(2);
    });

    showStats(groups);

    // Refresh legend if already visible
    if (map.hasLayer(lulcLayer)) {
      map.removeControl(legend);
      legend.addTo(map);
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById('statsBox').innerHTML =
      '⚠ Failed to load LULC statistics';
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
    { code: 10, name: 'Tree cover', color: '#006400' },
    { code: 20, name: 'Shrubland', color: '#ffbb22' },
    { code: 30, name: 'Grassland', color: '#ffff4c' },
    { code: 40, name: 'Cropland', color: '#f096ff' },
    { code: 50, name: 'Built-up', color: '#fa0000' },
    { code: 60, name: 'Bare / sparse', color: '#b4b4b4' },
    { code: 70, name: 'Snow & ice', color: '#f0f0f0' },
    { code: 80, name: 'Permanent water', color: '#0064c8' },
    { code: 90, name: 'Herbaceous wetland', color: '#0096a0' },
    { code: 95, name: 'Mangroves', color: '#00cf75' },
    { code: 100, name: 'Moss & lichen', color: '#fae6a0' }
  ];

  classes.forEach(function (item) {

    var percent = lulcPercent[item.code]
      ? lulcPercent[item.code] + ' %'
      : '';

    div.innerHTML +=
      '<i style="background:' + item.color + '"></i> ' +
      item.name +
      '<span style="float:right">' + percent + '</span><br>';
  });

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

  // -----------------------------
  // Ensure legend is shown on initial load
  // -----------------------------
  if (map.hasLayer(lulcLayer)) {
    legend.addTo(map);
  }
