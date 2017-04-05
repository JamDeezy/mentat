var d3 = require("d3");

// Classes
var BaseSVG = require("./BaseSVG");
var DataSet = require("./DataSet");
var Tooltip = require("./Tooltip");

// Styles
require("../stylesheets/line.scss");

// Constants
var DEFCOLORS = [
  "#3498db",
  "#1abc9c",
  "#2ecc71",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#9b59b6",
  "#ecf0f1",
  "#95a5a6",
  "#34495e"
];

// Line
//
function Line(selector, data, key, scale, color, tooltip, zoom) {
  // Scope our variables
  var line = this;
  line.base = new BaseSVG(selector, "line");
  line.dataSet = new DataSet(data, key.dimension, key.metric);
  line.key = key;
  line.scale = scale || {};
  line.color = color;
  line.tooltip = tooltip;
  line.x = line.scale.x || d3.scale.linear();
  line.y = line.scale.y || d3.scale.linear();
  line.z = d3.scale.ordinal();

  // Tooltip
  // Since we're using a overlay,
  // we don't have a data point to bind to
  var html = function() {
    // Find closest data value based on our
    // mouse's x position by inverting on x axis
    var val = line.x.invert(d3.mouse(this)[0]);
    var dp = line.dataSet.findApproxDs(val);

    scanner
      .style("display", null)
      .attr("transform", "translate(" + line.x(dp.key) + ", 0)");

    if (typeof line.tooltip === "undefined") {
      return "Tooltip missing!";
    } else {
      return line.tooltip(dp);
    }
  };
  line.tip = new Tooltip(selector, html);

  // Base SVG
  line.svg = line.base.svg;
  line.base.setState(BaseSVG.stateENUM.LOADING);

  // Instantiate axes
  // Configure the X axis (independent variable)
  line.x
    .range([0, line.base.width])
    .domain(line.dataSet.extent(line.key.dimension));

  line.svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + line.base.height + ")")
    .call(d3.svg.axis().scale(line.x).orient("bottom"));

  // Configure the Y axis (dependent variable[s])
  // Scale by 10% to give some vertical room
  var yRange = line.dataSet.extent(line.key.metric);
  line.y
    .range([line.base.height, 0])
    .domain([yRange[0] * 0.91, yRange[1] * 1.1]);

  line.svg
    .append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(line.y).orient("left"));

  // Configure the Z axis (coloring)
  // We define the colors as the z-axis, as we're visualizing
  // another dimension of information
  if (line.color instanceof Function) {
    // If its a function, we assume they passed in a d3 function
    line.z = line.color;
  } else if (line.scale instanceof Array) {
    // Compute a function that would map metrics to colors
    // in the user defined array.
    line.z.range(line.scale).domain(line.key.metric);
  } else {
    // Return our own default colors
    line.z.range(DEFCOLORS).domain(line.key.metric);
  }

  // Regular plotting function
  var plot = d3.svg
    .line()
    .x(function(d) {
      return line.x(d.key);
    })
    .y(function(d) {
      return line.y(d.value);
    });

  // Zero plotting function
  var zero = d3.svg
    .line()
    .x(function(d) {
      return line.x(d.key);
    })
    .y(function(d) {
      return line.y(yRange[0] * 0.91);
    });

  var set = line.svg
    .selectAll("set")
    // We want to transpose the data set so that
    // we have an array of points per set. This
    // makes our graphing function much simplier
    .data(line.dataSet.transpose(line.key.metric))
    .enter()
    .append("g")
    .attr("class", "set")
    // Append the path, which is the line at the end
    .append("path")
    .attr("class", "line")
    .style("stroke", function(d) {
      return line.z(d.key);
    })
    // The animation here is that we start off on the
    // x Axis and rise up to our final state
    .attr("d", function(d) {
      return zero(d.values);
    })
    // We implement some animations
    // Delay 350, easing function quadratic
    .transition()
    .duration(350)
    .ease("quad")
    .attr("d", function(d) {
      return plot(d.values);
    });

  // The line graph's tooltip will act on an overlay.
  // This is because the cursor behaviour on a line
  // rarely hovers over the path itself.
  line.svg
    .append("rect")
    .attr("class", "overlay")
    .attr("width", line.base.width)
    .attr("height", line.base.height)
    // The element must not capture pointer events as it
    // is ment to serve as an invisible screen
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseout", line.tip.hide)
    .on("mousemove", line.tip.show);

  // We offer a dashed line as a scanner to scan the
  // data point. We're going to have to find which
  // point it actually is later.
  var scanner = line.svg
    .append("g")
    .attr("class", "scanner")
    .append("line")
    .style("display", "none")
    .style("stroke-dasharray", "3, 3")
    .attr("y1", 0)
    .attr("y2", line.base.height);

  line.base.setState(BaseSVG.stateENUM.READY);

  return line;
}

module.exports = Line;
