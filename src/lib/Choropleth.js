var d3      = require("d3");

// Classes
var BaseSVG = require("./BaseSVG");
var DataSet = require("./DataSet");
var Tooltip = require("./Tooltip");

// Constants
var CAGEOJSON = APP_PATH + APP_VERSION + "/canada.json";
var USGEOJSON = APP_PATH + APP_VERSION + "/us.json";
var DEFCOLORS = ['#F7FBFF', '#DEEBF7', '#C6DBEF', '#9ECAE1', '#6BAED6',
                 '#4292C6', '#2171B5', '#08519C', '#08306B'];
var EMPTYCLR  = "#CCCCCC";


// Choropleth
// @selector           - querySelector string for the container element
// @data               - array of data to populate map
// @key                - hash of dimension and metric key values
// @country[optional]  - 2 letter country code (ca/us), default: ca
// @scale[optional]    - array of color codes or callback function for fill
// @tooltip[optional]  - call back for html string
function Choropleth(selector, data, key, country, scale, tooltip) {
  // Scope our variables
  var map       = this;
  map.base      = new BaseSVG(selector, 'choropleth'),
  map.dataSet   = new DataSet(data, key.dimension, key.metric),
  map.key       = key,
  map.scale     = scale,
  map.tooltip   = tooltip,
  map.country   = country;


  // Also instantiate our tooltip
  // We also need to bring forward the current svg
  var html = function(d) {
    var dp        = map.dataSet.findDs(d.properties.CODE);
    // Did not find data
    if (!dp)      return "No Data";

    var dimension = map.key.dimension.toUpperCase(),
        metric    = map.key.metric.toUpperCase(),
        key       = dp.key.toUpperCase(),
        value     = dp.value;

    if (typeof map.tooltip === 'undefined') {
      return dimension + " " + key + "<br>" + metric +
        ": " + (value % 1 != 0 ? d3.format(".2f")(value) : value)
    } else {
      return map.tooltip(dp);
    }
  }
  map.tip = new Tooltip(selector, html);


  // Find fill of a location based on data
  map.fill = function(data) {
    var extent = map.dataSet.extent(map.key.metric),
        key    = data.properties.CODE,
        dp     = map.dataSet.findDs(key);

    // Did not find data
    if (!dp) return EMPTYCLR;

    // if scale otherwise our own
    if (map.scale instanceof Function) {
      return map.scale(dp, extent);

    } else if (map.scale instanceof Array) {
      var index = map.linear(dp.value, extent, map.scale.length);
      return map.scale[index];

    } else {
      var index = map.linear(dp.value, extent, 9);
      return DEFCOLORS[index];
    }
  }


  // Linear - find the linear distributed value
  // using an extent of [min,max], n number of buckets
  // and the value.
  map.linear = function(value, extent, buckets) {
    var range = extent[1] - extent[0],
        size  = range / buckets,
        num   = (value - extent[0]) / size;

    // On the maximum, we return n - 1 since we
    // want our range to be [0, buckets)
    return value == extent[1] ? buckets - 1 : Math.floor(num);
  }


  // Build our base svg,
  map.svg = map.base.svg;
  map.base.setState(BaseSVG.stateENUM.LOADING);


  // Construct svg paths based on geoJson data,
  if (map.country === 'ca') {
    var projection = d3.geo.azimuthalEqualArea()
        .rotate([100, -45])
        .center([5, 20])
        .scale(map.base.width)
        .translate([map.base.width/2, map.base.height/2]);

    var path = d3.geo.path()
        .projection(projection);

    d3.json(CAGEOJSON, function(error, ca) {
      map.base.setState(BaseSVG.stateENUM.READY);

      map.svg.append("g")
          .selectAll("path")
          .data(ca.features)
          .enter()
        .append("path")
          .attr("d", path)
          .style("stroke", "white")
          .style("stroke-width", "1px")
          .attr("fill", map.fill)
          .on("mouseover", map.tip.show)
          .on("mouseout", map.tip.hide);
    });
  } else {
    var projection = d3.geo.albersUsa()
        .scale(map.base.width + 150) // Hardcode additional scale
        .translate([map.base.width/2, map.base.height/2]);

    var path = d3.geo.path()
        .projection(projection);

    d3.json(USGEOJSON, function(error, us) {
      map.base.setState(BaseSVG.stateENUM.READY);

      map.svg.append("g")
          .selectAll("path")
          .data(us.features)
          .enter()
        .append("path")
          .attr("d", path)
          .style("stroke", "white")
          .style("stroke-width", "1px")
          .attr("fill", map.fill)
          .on("mouseover", map.tip.show)
          .on("mouseout", map.tip.hide);
    });
  }

  window.test = this;
}

module.exports = Choropleth;