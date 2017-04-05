var d3 = require("d3");

// Classes
var BaseSVG = require("./BaseSVG");
var DataSet = require("./DataSet");
var Tooltip = require("./Tooltip");

require("../stylesheets/zoom.scss");

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

var ZOOMHEIGHT = 80;

function Zoom(selector, data, key, color, tooltip) {
  var zoom = this;
  zoom.base = new BaseSVG(selector, "zoom");
  zoom.dataSet = new DataSet(data, key.dimension, key.metric);

  var width = zoom.base.width;
  var style = zoom.base.container.currentStyle ||
    window.getComputedStyle(zoom.base.container);
  var marginTop = parseFloat(style.marginTop);
  var height2 = ZOOMHEIGHT;
  var height = zoom.base.height - height2 - marginTop;
  var parseDate = d3.time.format("%b %Y").parse;

  var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]),
    z = d3.scale.ordinal();

  var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

  var brush = d3.svg.brush().x(x2).on("brush", brushed);

  // Tooltip
  // Since we're using a overlay,
  // we don't have a data point to bind to
  var html = function() {
    // Find closest data value based on our
    // mouse's x position by inverting on x axis
    var val = x.invert(d3.mouse(this)[0]);
    var dp = zoom.dataSet.findApproxDs(val);

    scanner
      .style("display", null)
      .attr("transform", "translate(" + x(dp.key) + ", 0)");

    if (typeof tooltip === "undefined") {
      return "Tooltip missing!";
    } else {
      return tooltip(dp);
    }
  };
  tip = new Tooltip(selector, html);

  // Configure the Z axis (coloring)
  // We define the colors as the z-axis, as we're visualizing
  // another dimension of information
  if (color instanceof Function) {
    // If its a function, we assume they passed in a d3 function
    z = color;
  } else {
    // Return our own default colors
    z.range(DEFCOLORS).domain(key.metric);
  }

  var plot = d3.svg
    .line()
    .x(function(d) {
      return x(d.key);
    })
    .y(function(d) {
      return y(d.value);
    });
  var plot2 = d3.svg
    .line()
    .x(function(d) {
      return x2(d.key);
    })
    .y(function(d) {
      return y2(d.value);
    });

  var svg = zoom.base.svg;
  zoom.base.setState(BaseSVG.stateENUM.LOADING);

  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  var focus = svg.append("g").attr("class", "focus");

  var context = svg
    .append("g")
    .attr("class", "context")
    .attr("transform", "translate(0," + (height + marginTop) + ")");

  x.domain(zoom.dataSet.extent(key.dimension));
  var yRange = zoom.dataSet.extent(key.metric);
  y.domain([yRange[0] * 0.91, yRange[1] * 1.1]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus
    .selectAll("set")
    .data(zoom.dataSet.transpose(key.metric))
    .enter()
    .append("g")
    .attr("class", "set")
    .append("path")
    .attr("class", "line")
    .style("stroke", function(d) {
      return z(d.key);
    })
    .attr("d", function(d) {
      return plot(d.values);
    });

  focus
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.append("g").attr("class", "y axis").call(yAxis);

  // The line graph's tooltip will act on an overlay.
  // This is because the cursor behaviour on a line
  // rarely hovers over the path itself.
  svg
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    // The element must not capture pointer events as it
    // is ment to serve as an invisible screen
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseout", tip.hide)
    .on("mousemove", tip.show);

  // We offer a dashed line as a scanner to scan the
  // data point. We're going to have to find which
  // point it actually is later.
  var scanner = svg
    .append("g")
    .attr("class", "scanner")
    .append("line")
    .style("display", "none")
    .style("stroke-dasharray", "3, 3")
    .attr("y1", 0)
    .attr("y2", height);

  context
    .selectAll("set")
    .data(zoom.dataSet.transpose(key.metric))
    .enter()
    .append("g")
    .attr("class", "set")
    .append("path")
    .attr("class", "line")
    .style("stroke", function(d) {
      return z(d.key);
    })
    .attr("d", function(d) {
      return plot2(d.values);
    });

  context
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

  context
    .append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", -6)
    .attr("height", height2 + 7);

  // call drawBrush once on load with the default value
  var zoomA = 0;
  var zoomB = 1;
  drawBrush(zoomA, zoomB);

  function drawBrush(a, b) {
    // define our brush extent

    // note that x0 and x1 refer to the lower and upper bound of the brush extent
    // while x2 refers to the scale for the second x-axis, for the context or brush area.
    // unfortunate variable naming :-/
    var x0 = x2.invert(a * width);
    var x1 = x2.invert(b * width);
    console.log("x0", x0);
    console.log("x1", x1);
    brush.extent([x0, x1]);

    // now draw the brush to match our extent
    // use transition to slow it down so we can see what is happening
    // set transition duration to 0 to draw right away
    brush(d3.select(".brush").transition().duration(500));

    // now fire the brushstart, brushmove, and brushend events
    // set transition the delay and duration to 0 to draw right away
    brush.event(d3.select(".brush").transition().delay(1000).duration(500));
  }

  function brushed() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    focus.selectAll(".line").attr("d", function(d) {
      return plot(d.values);
    });
    focus.select(".x.axis").call(xAxis);
  }

  function type(d) {
    d.date = parseDate(d.date);
    d.price = +d.price;
    return d;
  }

  zoom.base.setState(BaseSVG.stateENUM.READY);
}

module.exports = Zoom;
