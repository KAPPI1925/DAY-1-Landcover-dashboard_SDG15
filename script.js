// =====================================================
// GLOBAL STORE FOR PERCENT VALUES
// =====================================================
var lulcPercent = {};

// =====================================================
// INITIALIZE MAP
// =====================================================
var map = L.map('map').setView([22.5, 78.9], 6);

// -----------------------------------------------------
// OpenStreetMap Base Layer
// -----------------------------------------------------
var osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '&copy; OpenStreetMap contributors' }
).addTo(map);

// -----------------------------------------------------
// ESA WorldCover (GEE Tile URL from urlFormat)
// -----------------------------------------------------
var lulcLayer = L.tileLayer(
  'https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/954125bc301a92b28b1410109bece3ad-eba78f2bca909ad1cc5257fc92500a5a/tiles/{z}/{x}/{y}',
  {
    minZoom: 5,
    maxZoom: 12
  }
).addTo(map);

// =====================================================
// CLASS DICTIONARY
// =====================================================
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

// =====================================================
// LOAD SDG-15 GEOJSON AND COMPUTE %
/* =================================================== */
fetch('data/India_SDG15_LULC_FINAL.geojson')
  .then(res => res.json())
  .then(data => {

    var groups = data.features[0].properties.groups;

    // Total area
    var totalArea = 0;
    groups.forEach(g => totalArea += g.sum);

    // Compute percentage
    groups.forEach(g => {
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

// =====================================================
// DISPLAY STATISTICS PANEL
// =====================================================
function showStats(groups) {

  var html = '<b>Land Cover Statistics (km²)</b><br><br>';

  groups.forEach(g => {
    html +=
      classDict[g.class] +
      ': ' +
      (g.sum / 1e6).toFixed(2) +
      ' km²<br>';
  });

  document.getElementById('statsBox').innerHTML = html;
}

// =====================================================
// LAYER CONTROL
// =====================================================
L.control.layers(
  { 'OpenStreetMap': osm },
  { 'ESA WorldCover': lulcLayer }
).addTo(map);

// =====================================================
// LEGEND DEFINITION (WITH % VALUES)
// =====================================================
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {

  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML = '<b>ESA WorldCover (2021)</b><br>';

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

  classes.forEach(item => {

    var percent = lulcPercent[item.code]
      ? lulcPercent[item.code] + ' %'
      : '';

    div.innerHTML +=
      '<i style="background:' + item.color + '"></i> ' +
      item.name +
      '<span style="float:right">' + percent + '</span><br>';
  });

  return div;
};

// =====================================================
// TOGGLE LEGEND WITH ESA LAYER
// =====================================================
map.on('overlayadd', e => {
  if (e.layer === lulcLayer) {
    legend.addTo(map);
  }
});

map.on('overlayremove', e => {
  if (e.layer === lulcLayer) {
    map.removeControl(legend);
  }
});

// =====================================================
// SHOW LEGEND ON INITIAL LOAD
// =====================================================
if (map.hasLayer(lulcLayer)) {
  legend.addTo(map);
}
