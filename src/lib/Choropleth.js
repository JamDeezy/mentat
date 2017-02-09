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
    if (!(dp && dp.value)) return "No Data";

    return typeof map.tooltip === 'undefined' ?
      "Tooltip missing!" : map.tooltip(dp);
  }
  map.tip = new Tooltip(selector, html);


  // Build our base svg,
  map.svg = map.base.svg;
  map.base.setState(BaseSVG.stateENUM.LOADING);


  // Calculate our scale function
  // or use a user defined scaling function
  var extent = d3.extent(
    map.dataSet.dsData,
    function(d) { return d.values.metric }
  )
  extent[0] = Math.floor(extent[0]);
  extent[1] = Math.ceil(extent[1]);

  if (map.color instanceof Function) {
    map.fill = map.color(extent);

  } else if (map.color instanceof Array) {
    var incr = Math.ceil((extent[1] - extent[0]) / (map.color.length));
    var range = d3.range(extent[0], extent[1], incr);
    range.shift();

    map.fill = d3.scale.threshold()
      .domain(range)
      .range(map.color);

  } else {
    map.fill = d3.scale.linear()
      .domain(extent)
      .range(DEFCOLORS);
  }

  // Create a scale that rests on the top right corner
  // width is half to the edge of the map
  var scaleWidth = [
    (map.base.width / 2) + (map.base.width * 0.1),
    map.base.width
  ]

  var x = d3.scale.linear()
    .domain(extent)
    .rangeRound(scaleWidth);

  var g = map.svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,20)");

  g.selectAll("rect")
    .data(map.fill.range().map(function(d) {
        d = map.fill.invertExtent(d)
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", function(d) { return x(d[0]); })
      .attr("width", function(d) { return x(d[1]) - x(d[0]); })
      .attr("fill", function(d) { return map.fill(d[0]); });

  g.call(d3.svg.axis().scale(x).orient('bottom')
      .tickFormat(function(d) { return d3.format('.2s')(d) })
      .tickValues(map.fill.domain()))
    .select(".domain")
      .remove();

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
        return (dp && dp.value) ? map.fill(dp.value) : EMPTYCLR;
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
