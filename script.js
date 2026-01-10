// =====================================================
// GLOBAL STORE FOR PERCENT VALUES
// =====================================================
var lulcPercent = {};

// Track active class filter
var activeClass = null;

var lulcStats = {};

var lulcGroups = null;


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
// CLASS-SPECIFIC GEE TILE LAYERS (FILTERING)
// =====================================================
var classLayers = {
  10: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/86c10f3f764b327cd56b3f3c74942f44-051d968df5ecd36a2e905eb3cf9f2b50/tiles/{z}/{x}/{y}'),
  20: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/fc3e7a8d5d812930cd5601d8458cbb0a-f7f2a858d920e148a3a33ba4fe202628/tiles/{z}/{x}/{y}'),
  30: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/d801d0f6b626f4896ba721ccd3bb5e1e-431323b56dcd988c88c2b5525e1afb52/tiles/{z}/{x}/{y}'),
  40: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/a5a1e2199213d6810db9b622cd8f2f70-29d61e96feba2ce9661785be0e7149d7/tiles/{z}/{x}/{y}'),
  50: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/d17f0a96f67ac929cefecc4a0fe4a5d4-b6e57a07529c5c22fd4f2c7bc85dd9e4/tiles/{z}/{x}/{y}'),
  60: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/2dca7a5f721aaf48d93554f70b431a0a-cca1062a816a66f1100c0261deda5c72/tiles/{z}/{x}/{y}'),
  70: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/3d62c86d6e5ec6341308de7b5315fd08-06fe89e9a6e9c51c0811e9eb05cf927c/tiles/{z}/{x}/{y}'),
  80: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/1200487e695bd1a13ddc338e2714bb0b-bc0b3593b0e2c5af7f895ec7e8a7d74f/tiles/{z}/{x}/{y}'),
  90: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/3f19ecd03827812349b5e50e431688c2-af81a025791e227160e8860c8264c6d5/tiles/{z}/{x}/{y}'),
  95: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/8ee185e3229133f5633a7e3954f459e5-08c13bdba03ee0f27d35600aa39b4623/tiles/{z}/{x}/{y}'),
  100: L.tileLayer('https://earthengine.googleapis.com/v1/projects/kappi1925-6d631/maps/c3ab55bac6fbd9b0240624d8c27c5083-742d22be327146db6af14151693c8072/tiles/{z}/{x}/{y}')
};

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
    lulcGroups = groups;

    // Total area
    var totalArea = 0;
    groups.forEach(g => totalArea += g.sum);

    // Compute percentage
    groups.forEach(g => {
      lulcStats[g.class] = {
        area_km2: (g.sum / 1e6).toFixed(2),
        percent: ((g.sum / totalArea) * 100).toFixed(2)
      };

      lulcPercent[g.class] = lulcStats[g.class].percent;
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
  L.DomEvent.disableClickPropagation(div);
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

    // Create one clickable row
    var row = L.DomUtil.create('div', 'legend-item', div);

    row.innerHTML =
      '<i style="background:' + item.color + '"></i> ' +
      '<span class="legend-label">' + item.name + '</span>' +
      '<span class="legend-percent">' +
      (lulcPercent[item.code] ? lulcPercent[item.code] + ' %' : '') +
      '</span>';

    row.style.cursor = 'pointer';

    // Click → filter map
    row.onclick = function () {

      // Remove previous highlight
      document.querySelectorAll('.legend-item')
        .forEach(el => el.classList.remove('active'));

      // Highlight current
      row.classList.add('active');

      filterByClass(item.code);
    };


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

// =====================================================
// SHOW LEGEND ON INITIAL LOAD
// =====================================================
if (map.hasLayer(lulcLayer)) {
  legend.addTo(map);
}

// =====================================================
// FILTER MAP BY LULC CLASS
// =====================================================
function filterByClass(classCode) {

  if (!lulcStats[classCode]) return;

  // Clicking same class again resets
  if (activeClass === classCode) {
    resetLULC();
    return;
  }

  activeClass = classCode;

  // 🔴 HIDE BASE LULC (KEY FIX)
  if (map.hasLayer(lulcLayer)) {
    map.removeLayer(lulcLayer);
  }

  // Remove previous class overlays
  Object.values(classLayers).forEach(layer => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  // Add selected class overlay
  if (classLayers[classCode]) {
    classLayers[classCode].addTo(map);
  }

  // Update stats panel
  document.getElementById('statsBox').innerHTML =
    '<b>' + classDict[classCode] + '</b><br>' +
    'Area: ' + lulcStats[classCode].area_km2 + ' km²<br>' +
    'Share: ' + lulcStats[classCode].percent + ' % of India';
}

function resetLULC() {

  activeClass = null;

  // Remove class overlays
  Object.values(classLayers).forEach(layer => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  // 🔵 RESTORE BASE LULC
  if (!map.hasLayer(lulcLayer)) {
    lulcLayer.addTo(map);
  }

  // Remove legend highlight
  document.querySelectorAll('.legend-item')
    .forEach(el => el.classList.remove('active'));

  // Restore full stats
  showStats(lulcGroups);
}


