var d3      = require("d3");

// Classes
var BaseSVG = require("./BaseSVG");
var DataSet = require("./DataSet");
var Tooltip = require("./Tooltip");



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
  line.dataSet   = new DataSet(data, key.dimension, key.metric),
  line.key       = key,
  line.scale     = scale,
  line.tooltip   = tooltip,
  line.x         = typeof line.scale.x === 'undefined' ?
                   d3.scale.linear() : line.scale.x,
  line.y         = typeof line.scale.y === 'undefined' ?
                   d3.scale.linear() : line.scale.y;


  // Also instantiate our tooltip
  // Since we're using a overlay,
  // we don't have a data point to bind to
  var html = function() {
    // Find closest data value based on our
    // mouse's x position by inverting on x axis
    var val = line.x.invert(d3.mouse(this)[0]);
    var dp  = line.dataSet.findApproxDs(val);

    scanner.style("display", null)
      .attr("transform", "translate(" + line.x(dp.key) + ", 0)");

    if (typeof line.tooltip === 'undefined') {
      return "Tooltip missing!";
    } else {
      return line.tooltip(dp);
    }
  }
  line.tip = new Tooltip(selector, html);


  // Colors
  // TODO, we could refactor graph objects
  // (i.e. axes, stroke) into another class
  line.stroke = function(d) {
    // If its a function, we assume they passed in a d3 function
    if (line.scale instanceof Function) {
      return line.scale(d);

    // Compute a function that would map metrics to colors
    // in the user defined array. NOTE: we're reinstanciating
    // this function at every call... Bad?
    } else if (line.scale instanceof Array) {
      return d3.scale.ordinal().range(line.scale).domain(line.key.metric)(d);

    // Return our own default colors
    } else {
      return d3.scale.ordinal().range(DEFCOLORS).domain(line.key.metric)(d);
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


  // Base SVG
  line.svg = line.base.svg;
  line.base.setState(BaseSVG.stateENUM.LOADING);

  // Configure the X axis (independent variable)
  line.x.range([0, line.base.width])
        .domain(line.dataSet.extent(line.key.dimension));

  line.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + line.base.height + ")")
    .call(line.axis('x', line.x));


  // Configure the Y axis (dependent variable[s])
  // Scale by 10% to give some vertical room
  var yxtent = line.dataSet.extent(line.key.metric)
  line.y.range([line.base.height, 0])
        .domain([yxtent[0] * 0.91, yxtent[1] * 1.1]);

  line.svg.append("g")
    .attr("class", "y axis")
    .call(line.axis('y', line.y));


  // Plotting function
  var plot = d3.svg.line()
    .x(function(d) { return line.x(d.key) })
    .y(function(d) { return line.y(d.value) });

  var set = line.svg.selectAll("set")
    .data(line.dataSet.transpose(line.key.metric))
    .enter()
    .append("g")
    .attr("class", "set");

  // Up animation
  var test = d3.svg.line()
    .x(function(d) { return line.x(d.key) })
    .y(function(d) { return line.y(yxtent[0] * 0.91) });

  var path = set.append("path")
    .attr("class", "line")
    .style("stroke", function(d) { return line.stroke(d.key); })
    .attr("d", function(d) { return test(d.values); })
    .transition()
    .duration(500)
    .ease("cubic")
    .attr("d", function(d) { return plot(d.values); })

  // Across animation
  // path.each(function(d) { d.tl = this.getTotalLength(); })
  //   .attr("stroke-dasharray", function(d) { return d.tl + " " + d.tl; })
  //   .attr("stroke-dashoffset", function(d) { return d.tl; })
  //   .transition()
  //   .duration(1000)
  //   .ease("linear")
  //   .attr("stroke-dashoffset", 0);


  // Hover scanner & point
  var scanner = line.svg.append("g")
    .attr("class", "scanner")
    .style("display", "none");

  scanner.append("line")
    .style("stroke-dasharray", ("3, 3"))
    .attr("y1", 0)
    .attr("y2", line.base.height);

  // Hover area overlay
  line.svg.append("rect")
      .attr("class", "overlay")
      .attr("width", line.base.width)
      .attr("height", line.base.height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseout", line.tip.hide)
      .on("mousemove", line.tip.show);

  line.base.setState(BaseSVG.stateENUM.READY);

  return line;
}

module.exports = Line
