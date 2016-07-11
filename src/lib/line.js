var DEFCOLORS = ["#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
                 "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"];

//
//
function Line(selector, key, axis, scale, tooltip) {
  var line = this;
  //
  line.container = document.querySelector(selector),
  line.width     = line.container.offsetWidth,
  line.height    = line.container.offsetHeight,
  line.key       = key,
  line.scale     = scale,
  line.tooltip   = tooltip;


  line.stroke = function(d) {
    debugger
    if (line.scale instanceof Function) {

    } else if (line.scale instanceof Array) {

    } else {

    }
  }

  line.xAxis = function() {
    if (axis.x instanceof Function) {

    } else if (axis.x instanceof Object) {

    } else {

    }
  }

  line.yAxis = function() {
    if (axis.u instanceof Function) {

    } else if (axis.y instanceof Object) {

    } else {

    }
  }

  // Base SVG
  line.svg = d3.select(selector)
      .classed("mentat", true)
      .classed("line", true)
    .append("svg")
      .attr("width", line.width)
      .attr("height", line.height)
      .style("background","#cccccc")
    .append("g")
      .attr("transform", "translate(20,20)");

  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  line.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(line.xAxis());

  line.svg.append("g")
    .attr("class", "y axis")
    .call(line.yAxis());

  var plot = d3.svg.line()
    .x(function(d) { return x(d.x) })
    .y(function(d) { return y(d.y) });

}

module.exports = Line
// TODO
// 1) figure out the margins of svg based on css
