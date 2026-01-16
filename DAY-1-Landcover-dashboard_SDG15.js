/***************************************
 * SDG-15 National Land Cover Dashboard
 * Dataset : ESA WorldCover v200 (2021)
 * Country : India
 * Platform: Google Earth Engine App
 ***************************************/

// ==================================================
// 1. LOAD DATA
// ==================================================

var lulc = ee.Image('ESA/WorldCover/v200/2021')
  .select('Map')
  .reproject({
    crs: 'EPSG:4326',
    scale: 500
  });

var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');
var countryName = 'India';

var country = countries.filter(
  ee.Filter.eq('country_na', countryName)
);

var countryGeom = country.geometry().simplify(1000);

// ==================================================
// 2. CREATE MAP WIDGET (IMPORTANT)
// ==================================================

var map = ui.Map();
map.setOptions('SATELLITE');
map.centerObject(country, 5);

// ==================================================
// 3. CLASS INFO
// ==================================================

var classInfo = {
  10: { name: 'Tree cover', color: '#006400' },
  20: { name: 'Shrubland', color: '#ffbb22' },
  30: { name: 'Grassland', color: '#ffff4c' },
  40: { name: 'Cropland', color: '#f096ff' },
  50: { name: 'Built-up', color: '#fa0000' },
  60: { name: 'Bare / sparse', color: '#b4b4b4' },
  70: { name: 'Snow & ice', color: '#f0f0f0' },
  80: { name: 'Permanent water', color: '#0064c8' },
  90: { name: 'Herbaceous wetland', color: '#0096a0' },
  95: { name: 'Mangroves', color: '#00cf75' },
  100: { name: 'Moss & lichen', color: '#fae6a0' }
};

var classCodes = Object.keys(classInfo).map(Number);

// Palette (ES5 safe)
var palette = classCodes.map(function (c) {
  return classInfo[c].color;
});

// ==================================================
// 4. BASE LULC LAYER
// ==================================================

var lulcLayer = ui.Map.Layer(
  lulc.clip(country),
  { min: 10, max: 100, palette: palette },
  'ESA WorldCover 2021',
  true
);

map.layers().set(0, lulcLayer);
map.addLayer(country, { color: 'black' }, 'India Boundary');

// ==================================================
// 5. AREA STATISTICS
// ==================================================

function computeAreaStats(image) {

  var areaImg = ee.Image.pixelArea().addBands(image);

  var stats = areaImg.reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: 'class'
    }),
    geometry: countryGeom,
    scale: 500,
    maxPixels: 1e13,
    tileScale: 8
  });

  return stats.get('groups');
}

// ==================================================
// 6. CLASS FILTER
// ==================================================

function showClass(code) {

  while (map.layers().length() > 2) {
    map.layers().remove(map.layers().get(2));
  }

  var classImg = lulc.eq(code).selfMask().clip(country);

  var classLayer = ui.Map.Layer(
    classImg,
    { palette: [classInfo[code].color] },
    classInfo[code].name,
    true
  );

  map.layers().add(classLayer);
  updateStatsPanel(code);
}

// ==================================================
// 7. RESET
// ==================================================

function resetLULC() {
  while (map.layers().length() > 2) {
    map.layers().remove(map.layers().get(2));
  }
  updateStatsPanel(null);
}

// ==================================================
// 8. STATISTICS PANEL
// ==================================================

var statsLabel = ui.Label('Loading statistics…', { whiteSpace: 'pre' });

function updateStatsPanel(selectedClass) {

  var groups = computeAreaStats(lulc);

  groups.evaluate(function (g) {

    if (!g) {
      statsLabel.setValue('Statistics unavailable');
      return;
    }

    var totalArea = 0;
    g.forEach(function (d) {
      totalArea += d.sum;
    });

    var text = 'Land Cover Statistics (km²)\n\n';

    g.forEach(function (d) {

      var areaKm2 = (d.sum / 1e6).toFixed(2);
      var percent = ((d.sum / totalArea) * 100).toFixed(2);

      if (!selectedClass || d.class === selectedClass) {
        text += classInfo[d.class].name +
          ': ' + areaKm2 + ' km² (' + percent + '%)\n';
      }
    });

    statsLabel.setValue(text);
  });
}

updateStatsPanel(null);

// ==================================================
// 9. UI CONTROLS
// ==================================================

var selectItems = classCodes.map(function (c) {
  return {
    label: classInfo[c].name,
    value: c
  };
});

var classSelect = ui.Select({
  items: selectItems,
  placeholder: 'Select LULC Class',
  onChange: function (value) {
    showClass(Number(value));
  }
});

var resetButton = ui.Button({
  label: 'Show Full LULC',
  onClick: resetLULC
});

// ==================================================
// 10. APP LAYOUT (LEFT PANEL + MAP)
// ==================================================

ui.root.clear();

var controlPanel = ui.Panel({
  widgets: [
    ui.Label('SDG-15 | National Land Cover (India)', {
      fontWeight: 'bold',
      fontSize: '16px',
      margin: '0 0 8px 0'
    }),
    classSelect,
    resetButton,
    ui.Label(''),
    statsLabel
  ],
  style: {
    width: '320px',
    padding: '10px',
    backgroundColor: 'white'
  }
});

var mainLayout = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal'),
  style: { stretch: 'both' }
});

mainLayout.add(controlPanel);
mainLayout.add(map);

ui.root.add(mainLayout);
