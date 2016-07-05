var d3 = require('d3');
var topojson = require("topojson");


// Constants
var CAGEOJSON = APP_PATH + APP_VERSION + "/canada.json";
var USGEOJSON = APP_PATH + APP_VERSION + "/us.json";
var DEFCOLORS = ['#F7FBFF', '#DEEBF7', '#C6DBEF', '#9ECAE1', '#6BAED6',
                 '#4292C6', '#2171B5', '#08519C', '#08306B'];

function Map(selector, country, data, key, scale) {
  var map = this;
  // Scope our variables
  map.container = document.querySelector(selector);
  map.width     = map.container.offsetWidth;
  map.height    = map.container.offsetHeight;
  map.country   = country;
  map.data      = data;
  map.key       = key;
  map.scale     = scale;
  map.centered  = false;


  // functionailty for when a state/province is clicked
  // We zoom in on the centroid by a factor of 2
  map.clicked = function(d) {
    var x, y, k;

    if (d && map.centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 4;
      centered = d;
    } else {
      x = map.width / 2;
      y = map.height / 2;
      k = 1;
      map.centered = null;
    }

    g.selectAll("path")
      .classed("active", map.centered && function(d) { return d === map.centered; });

    g.transition()
      .duration(750)
      .attr("transform",
        "translate(" + map.width / 2 + "," + map.height / 2 + ")" +
        "scale(" + k + ")" +
        "translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
  }


  // find fill of a location based on data
  map.fill = function(location) {
    var extent = d3.extent(data, function(d) { return d[key.metric] });

    // if color otherwise our own
    for (var i = 0; i < data.length; i++) {
      if (data[i][key.dimension] === location) {
        if (map.scale instanceof Function) {
          return map.scale(data[i]);
        } else if (map.scale instanceof Array) {
          // Use their array of colors
          var index = map.linear(extent, map.scale.length, data[i][key.metric]);
          return map.scale[index];
        } else {
          var index = map.linear(extent, 9, data[i][key.metric]);
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


  // Build our base svg,
  map.svg = d3.select(selector).append("svg")
      .attr("width", map.width)
      .attr("height", map.height);

  // append a background rect that absorbs all pointer interaction.
  map.svg.append("rect")
      .attr("fill", "none")
      .style("pointer-events", "all")
      .attr("width", map.width)
      .attr("height", map.height)
      .on("click", map.clicked);

  // Create an invisible div for our tooltip
  map.div = d3.select(selector)
      .append("div")
      .style("opacity", 0)
      .style("text-align", "center")
      .style("position", "absolute")
      .style("width", "150px")
      .style("height", "25px")
      .style("padding", "2px")
      .style("font-size", "10px")
      .style("background", "#FFFFE0")
      .style("pointer-events", "none")

  var g = map.svg.append("g");

  // Construct svg paths based on geoJson data,
  if (map.country === 'ca') {
    var projection = d3.geoAzimuthalEqualArea()
        .rotate([100, -45])
        .center([5, 20])
        .scale(map.width)
        .translate([map.width/2, map.height/2])

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
         .style("stroke-width", "1.5px")
         .attr("fill", function(d) { return map.fill(d.properties.CODE) })
         .on("click", map.clicked)
      //Adding mouseevents
      .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(300)
          .style("stroke", "black");
        map.div.transition()
          .duration(300)
          .style("opacity", 1)
        map.div.text("HI")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY -30) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition().duration(300)
          .style("stroke", "white")
        map.div.transition().duration(300)
          .style("opacity", 0);
      });
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
         .attr("fill", function(d) { return map.fill(d.properties.CODE) })
         .on("click", map.clicked);
    });
  }
}

module.exports = Map;
// TODO
// 2) queuejs for importing geojsons
// 3) upload geojson files with deploy