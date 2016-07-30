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
function Choropleth(selector, data, key, country, color, tooltip) {
  // Scope our variables
  var map       = this;
  map.base      = new BaseSVG(selector, 'choropleth'),
  map.dataSet   = new DataSet(data, key.dimension, key.metric),
  map.key       = key,
  map.color     = color,
  map.tooltip   = tooltip,
  map.country   = country;


  // Tooltip
  var html = function(d) {
    var dp = map.dataSet.findDs(d.properties.CODE);
    if (!dp) return "No Data";

    return typeof map.tooltip === 'undefined' ?
      "Tooltip missing!" : map.tooltip(dp);
  }
  map.tip = new Tooltip(selector, html);


  // Build our base svg,
  map.svg = map.base.svg;
  map.base.setState(BaseSVG.stateENUM.LOADING);


  // Calculate our scale function
  // or use a user defined scaling function
  var extent = map.dataSet.extent(map.key.metric);
  if (map.color instanceof Function) {
    map.fill = map.color(extent);

  } else if (map.color instanceof Array) {
    map.fill = d3.scale.linear()
      .domain(extent)
      .range(map.color);

  } else {
    map.fill = d3.scale.linear()
      .domain(extent)
      .range(DEFCOLORS);
  }


  // Construct svg paths based on geoJson data,
  var url = (map.country === 'ca') ? CAGEOJSON : USGEOJSON;

  // Our Canadian projection method is slightly different
  // than our American counterpart. We also take in account
  // a manual inflation of the US land base because that
  // country isn't very big =/
  var projection = (map.country === 'ca') ?
    d3.geo.azimuthalEqualArea()
      .rotate([100, -45])
      .center([5, 20])
      .scale(map.base.width)
      .translate([map.base.width/2, map.base.height/2]) :
    d3.geo.albersUsa()
      .scale(map.base.width + 150)
      .translate([map.base.width/2, map.base.height/2])

  var path = d3.geo.path()
    .projection(projection);


  // Fetch our geoJson
  d3.json(url, function(error, country) {
    map.svg.append("g")
      .selectAll("path")
      .data(country.features).enter()
      .append("path")
      .attr("d", path)

      // We need to add a stroke here, otherwise
      // the borders for adjacent state/prov with the
      // same values to disappear
      .style("stroke", "white")
      .style("stroke-width", "2px")

      // The fill function will require use to find the
      // relevant data point and then return the fill
      // based on that point
      .attr("fill", function(d) {
        var dp = map.dataSet.findDs(d.properties.CODE);
        return (dp) ? map.fill(dp.value) : EMPTYCLR;
      })

      // Hover here will return a geo json data point
      // which in turn will be used as a search key
      // to get our actual data point
      .on("mouseover", map.tip.show)
      .on("mouseout", map.tip.hide);

    map.base.setState(BaseSVG.stateENUM.READY);
  });

  return map;
}

module.exports = Choropleth;