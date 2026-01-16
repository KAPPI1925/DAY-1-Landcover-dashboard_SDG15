/***************************************
 * SDG-15 National Land Cover Dashboard
 * Dataset : ESA WorldCover v200 (2021)
 * Platform: Google Earth Engine App
 ***************************************/

// ==================================================
// 1. DATA
// ==================================================

var lulc = ee.Image('ESA/WorldCover/v200/2021')
  .select('Map')
  .reproject({ crs: 'EPSG:4326', scale: 500 });

var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');

// ==================================================
// 2. CLASS INFO
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
var palette = classCodes.map(function (c) { return classInfo[c].color; });

// ==================================================
// 3. MAP WIDGET
// ==================================================

var map = ui.Map();
map.setOptions('SATELLITE');

// ==================================================
// COUNTRY SELECT (FIXED – CLIENT SIDE)
// ==================================================

var countrySelect = ui.Select({
  placeholder: 'Select Country'
});

// Populate dropdown safely
countries.aggregate_array('country_na').evaluate(function (list) {

  list.sort();

  countrySelect.items().reset(list);

  // Default country
  countrySelect.setValue('India', false);
});

// On change
countrySelect.onChange(function (name) {
  loadCountry(name);
});

// ==================================================
// 5. LOAD COUNTRY FUNCTION
// ==================================================

var country, countryGeom;

function loadCountry(name) {

  country = countries.filter(ee.Filter.eq('country_na', name));
  countryGeom = country.geometry().simplify(1000);

  map.centerObject(country, 5);

  map.layers().reset([
    ui.Map.Layer(
      lulc.clip(country),
      { min: 10, max: 100, palette: palette },
      'ESA WorldCover',
      true
    ),
    ui.Map.Layer(
      country.style({
        color: 'black',      // boundary color
        width: 2,            // boundary thickness
        fillColor: '00000000' // transparent fill
      }),
      {},
      name + ' Boundary'
    )

  ]);

  updateStatsPanel(null);
}

// ==================================================
// 6. AREA STATS
// ==================================================

function computeAreaStats() {

  var areaImg = ee.Image.pixelArea().addBands(lulc);

  return areaImg.reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: 'class'
    }),
    geometry: countryGeom,
    scale: 500,
    maxPixels: 1e13,
    tileScale: 8
  }).get('groups');
}

// ==================================================
// 7. CLASS FILTER
// ==================================================

function showClass(code) {

  while (map.layers().length() > 2) {
    map.layers().remove(map.layers().get(2));
  }

  var img = lulc.eq(code).selfMask().clip(country);

  map.layers().add(
    ui.Map.Layer(
      img,
      { palette: [classInfo[code].color] },
      classInfo[code].name,
      true
    )
  );

  updateStatsPanel(code);
}

function resetLULC() {
  while (map.layers().length() > 2) {
    map.layers().remove(map.layers().get(2));
  }
  updateStatsPanel(null);
}

// ==================================================
// 8. STATISTICS + PIE CHART
// ==================================================

var statsLabel = ui.Label('', { whiteSpace: 'pre' });
var piePanel = ui.Panel();

function updateStatsPanel(selectedClass) {

  computeAreaStats().evaluate(function (g) {

    if (!g) {
      statsLabel.setValue('No statistics available');
      return;
    }

    var total = 0;
    g.forEach(function (d) { total += d.sum; });

    var text = 'Land Cover Statistics (km²)\n\n';
    piePanel.clear();

    g.forEach(function (d) {

      var area = (d.sum / 1e6).toFixed(2);
      var pct = ((d.sum / total) * 100).toFixed(2);

      if (!selectedClass || d.class === selectedClass) {
        text += classInfo[d.class].name +
          ': ' + area + ' km² (' + pct + '%)\n';
      }

      piePanel.add(
        ui.Label(classInfo[d.class].name + ': ' + pct + '%', {
          color: classInfo[d.class].color
        })
      );
    });

    statsLabel.setValue(text);
  });
}

// ==================================================
// 9. LEGEND WITH COLOR SWATCHES
// ==================================================

var legend = ui.Panel();

classCodes.forEach(function (c) {
  legend.add(
    ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal'),
      widgets: [
        ui.Label('', {
          backgroundColor: classInfo[c].color,
          padding: '8px',
          margin: '0 6px 0 0'
        }),
        ui.Label(classInfo[c].name)
      ]
    })
  );
});

// ==================================================
// 10. EXPORT BUTTON
// ==================================================

var exportBtn = ui.Button({
  label: 'Export Statistics (CSV)',
  onClick: function () {

    var fc = ee.FeatureCollection(
      computeAreaStats().map(function (d) {
        return ee.Feature(null, d);
      })
    );

    Export.table.toDrive({
      collection: fc,
      description: 'SDG15_LULC_' + countrySelect.getValue(),
      fileFormat: 'CSV'
    });
  }
});

// ==================================================
// 11. UI CONTROLS
// ==================================================

var classSelect = ui.Select({
  placeholder: 'Select LULC Class',
  items: classCodes.map(function (c) {
    return { label: classInfo[c].name, value: c };
  }),
  onChange: function (v) { showClass(Number(v)); }
});

var resetButton = ui.Button('Show Full LULC', resetLULC);

// ==================================================
// 12. RESPONSIVE LAYOUT
// ==================================================

ui.root.clear();

var controlPanel = ui.Panel({
  widgets: [
    ui.Label('SDG-15 | National Land Cover', {
      fontWeight: 'bold', fontSize: '16px'
    }),
    countrySelect,
    classSelect,
    resetButton,
    exportBtn,
    ui.Label(''),
    statsLabel,
    ui.Label('Legend'),
    legend,
    ui.Label('Pie Summary'),
    piePanel
  ],
  style: {
    width: '340px',
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

// Load default
loadCountry('India');