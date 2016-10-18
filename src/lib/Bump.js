var d3      = require("d3");

// Classes
var BaseSVG = require("./BaseSVG");
var DataSet = require("./DataSet");
var Tooltip = require("./Tooltip");


// Styles
require("../stylesheets/bump.scss");

// Constants


// Bump
//
function Bump(selector, data, key, scale, color, tooltip) {
  // Scope our variables
  var bump = this;
  bump.base      = new BaseSVG(selector, 'bump'),
  bump.dataSet   = new DataSet(data, key.dimension, key.metric),
  bump.key       = key,
  bump.scale     = scale || {},
  bump.color     = color,
  bump.tooltip   = tooltip,
  bump.x         = bump.scale.x || d3.scale.bumpar(),
  bump.y         = bump.scale.y || d3.scale.ordinal(),


  // Base
  bump.svg = bump.base.svg;
  bump.base.setState(BaseSVG.stateENUM.LOADING);


  // Instantiate axes
  // Configure the X axis (independent variable)
  bump.x.range([0, bump.base.width])
    .domain(bump.dataSet.extent(bump.key.dimension))

  bump.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + bump.base.height + ")")
    .call(d3.svg.axis().scale(bump.x).orient('bottom'));


  // Configure the Y axis (dependent variable[s])
  // Scale by 10% to give some vertical room
  bump.y.range([bump.base.height, 0])
    .domain([0, bump.key.top]);

  bump.svg.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(bump.y).orient('left'));


    // look into data
  var plot = d3.svg.line()
    .x(function(d) { return bump.x(d.key) })
    .y(function(d) { debugger; });

  var set = bump.svg.selectAll("set")
    .data(bump.dataSet.transpose(bump.key.metric))
    .enter()
    .append("g")
    .attr("class", "set")
    .append("path")
    .attr("class", "line")
    .style("stroke", "#000000")
    .attr("d", function(d) { return plot(d.values) });

  bump.base.setState(BaseSVG.stateENUM.READY);
  return bump;
}

module.exports = Bump