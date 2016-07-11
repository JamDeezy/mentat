var d3 = require('d3');
var topojson = require("topojson");


// Constants
var CAGEOJSON = APP_PATH + APP_VERSION + "/canada.json";
var USGEOJSON = APP_PATH + APP_VERSION + "/us.json";
var DEFCOLORS = ['#F7FBFF', '#DEEBF7', '#C6DBEF', '#9ECAE1', '#6BAED6',
                 '#4292C6', '#2171B5', '#08519C', '#08306B'];


// Choropleth
// @selector - querySelector string for the container element
// @country - 2 letter country code (ca/us)
// @data[optional] - array of data to populate map
// @key[optional] - hash of dimension and metric key values
// @scale[optional] - array of color codes or callback function for fill
function Choropleth(selector, country, data, key, scale, tooltip) {
  var map = this;
  // Scope our variables
  map.container = document.querySelector(selector),
  map.width     = map.container.offsetWidth,
  map.height    = map.container.offsetHeight,
  map.country   = country,
  map.data      = data,
  map.key       = key,
  map.scale     = scale,
  map.tooltip   = tooltip,


  // Find fill of a location based on data
  map.fill = function(data) {
    var extent = d3.extent(map.data, function(d) { return d[key.metric] }),
        value  = data.properties.CODE

    // if color otherwise our own
    for (var i = 0; i < map.data.length; i++) {
      if (map.data[i][map.key.dimension] === value) {

        if (map.scale instanceof Function) {
          return map.scale(data[i]);
        } else if (map.scale instanceof Array) {
          var index = map.linear(
            extent, map.scale.length, map.data[i][map.key.metric]);

          return map.scale[index];
        } else {
          var index = map.linear(
            extent, 9, map.data[i][map.key.metric]);

          return DEFCOLORS[index];
        }
      }
    }
  }


  // Linear - find the linear distributed value
  // using an extent of [min,max], n number of buckets
  // and the value.
  map.linear = function(extent, buckets, value) {
    var range = extent[1] - extent[0],
        size = range / buckets,
        num = (value - extent[0]) / size

    // On the maximum, we return buckets - 1 since we want our
    // range to be [0, buckets)
    return value == extent[1] ? buckets - 1 : Math.floor(num);
  }


  // Show tooltip
  map.showTooltip = function(data) {
    var dp = map.data.find(function(d) {
      return d[map.key.dimension] === data.properties.CODE
    });

    var dimension = map.key.dimension.toUpperCase(),
        metric    = map.key.metric.toUpperCase(),
        key       = dp[map.key.dimension].toUpperCase(),
        value     = dp[map.key.metric]

    this.parentNode.appendChild(this);

    d3.select(this)
      .transition()
      .duration(300)
      .style("stroke", "black");

    map.div.transition()
      .duration(300)
      .style("opacity", 1);

    map.div.style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 30) + "px");

    if (typeof map.tooltip === 'undefined') {
      map.div.html(dimension + ": " + key + "<br>" +
                   metric + ": " + d3.format(".2f")(value));
    } else {
      map.div.html(map.tooltip(d));
    }
  }


  // Hide tooltip
  map.hideTooltip = function(d) {
    d3.select(this)
      .transition().duration(300)
      .style("stroke", "white");

    map.div.transition().duration(300)
      .style("opacity", 0);
  }


  // Build our base svg,
  map.svg = d3.select(selector)
      .classed("mentat", true)
      .classed("choropleth", true)
    .append("svg")
      .attr("width", map.width)
      .attr("height", map.height);

  // append a background rect that absorbs all pointer interaction.
  map.svg.append("rect")
      .attr("fill", "none")
      .style("pointer-events", "all")
      .attr("width", map.width)
      .attr("height", map.height);

  // Create an invisible div for our tooltip
  map.div = d3.select(selector)
      .append("div")
      .classed("tooltip", true)
      .style("opacity", 0);

  // Construct svg paths based on geoJson data,
  var g = map.svg.append("g");
  if (map.country === 'ca') {
    var projection = d3.geoAzimuthalEqualArea()
        .rotate([100, -45])
        .center([5, 20])
        .scale(map.width)
        .translate([map.width/2, map.height/2]);

    var path = d3.geoPath()
        .projection(projection);

    d3.json(CAGEOJSON, function(error, ca) {
      g.append("g")
          .selectAll("path")
          .data(ca.features)
          .enter()
        .append("path")
          .attr("d", path)
          .style("stroke", "white")
          .style("stroke-width", "1px")
          .attr("fill", map.fill)
          .on("mouseover", map.showTooltip)
          .on("mouseout", map.hideTooltip);
    });
  } else {
    var projection = d3.geoAlbersUsa()
        .scale(map.width)
        .translate([map.width/2, map.height/2]);

    var path = d3.geoPath()
        .projection(projection);

    d3.json(USGEOJSON, function(error, us) {
      g.append("g")
          .selectAll("path")
          .data(topojson.feature(us, us.objects.states).features)
          .enter()
        .append("path")
          .attr("d", path)
          .attr("fill", map.fill)
          .on("mouseover", map.showTooltip)
          .on("mouseout", map.hideTooltip);
    });
  }
}

module.exports = Choropleth;
// TODO
// 1) click call back to main script
// 2) queuejs for importing geojsons
// 3) upload geojson files with deploy