var d3 = require('d3');
var BaseSVG = require("./BaseSVG");
var DataSet = require("./DataSet");


// Styles
require("../stylesheets/line.scss");

// Constants
var DEFCOLORS = ["#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
                 "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"];

// Line
//
function Line(selector, data, key, axis, scale, tooltip) {
  // Scope our variables
  var line       = this;
  line.base      = new BaseSVG(selector, 'line'),
  line.data      = new DataSet(data, key.dimension, key.metric),
  line.scale     = scale,
  line.tooltip   = tooltip,
  line.x         = d3.scale.linear().range([0, line.width]),
  line.y         = d3.scale.linear().range([line.height, 0]);;

  // Colors
  line.stroke = function(d) {
    if (line.scale instanceof Function) {
      return
    } else if (line.scale instanceof Array) {
      return
    } else {
      return
    }
  }

  // Axis
  line.axis = function(key, scale) {
    // If they provide a function, we assume
    // its a d3 axis object.
    if (line.axis[key] instanceof Function) {
      return line.axis[key]

    // If the value is a hash, we'll create the d3 object
    // based on the keys that are specified
    } else if (line.axis[key] instanceof Object) {
      var axis = d3.svg.axis()
        .orient(line.axis[key].orient)
        .scale(scale);

      if (typeof line.axis[key].ticks !== 'undefined')
        axis.ticks(line.axis[key].ticks);
      if (typeof line.axis[key].tickFormat != 'undefined')
        axis.tickFormat(line.axis[key].tickFormat);
      if (typeof line.axis[key].tickPadding != 'undefined')
        axis.tickPadding(line.axis[key].tickFormat);
      if (typeof line.axis[key].tickSize != 'undefined')
        axis.tickSize(meta.tickSize);

      return axis;

    // Default axis
    } else {
      return d3.svg.axis()
        .orient((key === 'x') ? 'bottom' : 'left')
        .scale(scale);
    }
  }

  // Figure out domain + range of data
  line.x.domain(
    typeof line.scale.x === 'undefined' ?
    d3.extent(line.data, function(d) { return d[line.key.dimension]}) :
    line.scale.x
  );
  line.y.domain(
    typeof line.scale.y === 'undefined' ?
    d3.extent(line.data, function(d) { return d[line.key.metric] }) :
    line.scale.y
  );


  // Base SVG
  line.svg = line.base.svg;
  line.base.setState(BaseSVG.stateENUM.LOADING);

  line.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + line.height + ")")
    .call(line.axis('x', line.x));

  line.svg.append("g")
    .attr("class", "y axis")
    .call(line.axis('y', line.y));

  var plot = d3.svg.line()
    .x(function(d) { return x(d.x) })
    .y(function(d) { return y(d.y) });
}

module.exports = Line
