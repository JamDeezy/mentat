var d3      = require("d3");

// Classes
var BaseSVG = require("./BaseSVG");
var DataSet = require("./DataSet");
var Tooltip = require("./Tooltip");


// Styles
require("../stylesheets/bar.scss");

// Constants
var DEFCOLORS = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b",
                 "#a05d56", "#d0743c", "#ff8c00"];

// Horizontal Bar
//
function XBar(selector, data, key, scale, color, tooltip) {
  // Scope our variables
  var bar     = this;
  bar.base    = new BaseSVG(selector, 'bar'),
  bar.dataSet = new DataSet(data, key.dimension, key.metric),
  bar.key     = key,
  bar.scale   = scale || {},
  bar.color   = color,
  bar.tooltip = tooltip,
  bar.x       = bar.scale.x || d3.scale.linear(),
  bar.y       = bar.scale.y || d3.scale.ordinal(),
  bar.z       = d3.scale.ordinal();


  // Tooltip
  var html = function(d) {
    // Conform to format :)
    var dp  = bar.dataSet.findDs(d.key);

    // We calculate the x/y position of the tooltip
    var x   = bar.x(d3.sum(dp.value)),
        y   = bar.y(d.key);

    // Return the tooltip string
    if (typeof bar.tooltip === 'undefined') {
      return "Tooltip missing!";
    } else {
      return [ bar.tooltip(dp), [x,y] ];
    }
  }
  bar.tip = new Tooltip(selector, html);


  // Base SVG
  bar.svg = bar.base.svg;
  bar.base.setState(BaseSVG.stateENUM.LOADING);


  // Configure the Y axis (independent variable)
  // Scale by 10% to give some vertical room
  // We want to sum up all the metrics for a stacked bar graph
  bar.y.rangeRoundBands([0, bar.base.height], 0.2)
    .domain(bar.dataSet.origData.map(function(d) {
      return d[bar.key.dimension]
    }));

  bar.svg.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(bar.y).orient('left'));

  // Instantiate axes
  // Configure the X axis (dependent variable[s]))
  var xRange = bar.dataSet.extent(function(d) {
    var sum = 0;
    for (var i = 0, sum = 0;
         i < bar.key.metric.length; i++) {
      sum += d[0][bar.key.metric[i]];
    }
    return sum;
  })

  bar.x.range([0, bar.base.width])
    .domain([0, xRange[1] * 1.1]);

  bar.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + bar.base.height + ")")
    .call(d3.svg.axis().scale(bar.x).orient('bottom'));


  // Configure the Z axis (coloring)
  // We define the colors as the z-axis, as we're visualizing
  // another dimension of information
  if (bar.color instanceof Function) {
    // If its a function, we assume they passed in a d3 function
    bar.z = bar.color;

  } else if (bar.scale instanceof Array) {
    debugger
    // Compute a function that would map metrics to colors
    // in the user defined array.
    bar.z.range(bar.scale)
      .domain(bar.key.metric);

  } else {
    // Return our own default colors
    bar.z.range(DEFCOLORS)
      .domain(bar.key.metric);
  }


  // Create an array of svg stacks
  // which are the parent <g> elements that will
  // hold each individual rect
  var stack = bar.svg.selectAll(".stack")
    .data(bar.dataSet.dsData)
    .enter()
    .append("g")
    .attr("class", "stack")
    .attr("transform", function(d) {
      return "translate(0,"+bar.y(d.key)+")"
    })
    .on("mouseout", bar.tip.hide)
    .on("mousemove", bar.tip.show);


  // Separate each stack of bars into
  // individual bars so we can color and stack
  stack.selectAll("rect")
    .data(function(d) {
      if (bar.key.metric instanceof Array) {
        var keys = bar.key.metric,
            arr  = [],
            sum  = 0;

        // We want to create an array of stacking bars,
        // aka: bar1.y1 = bar2.y0 && bar2.y1 = bar3.y0
        for (var i = 0; i < keys.length; i++) {
          arr.push({
            y: keys[i],
            x0: sum,
            x1: sum += d.values.metric[i]
          });
        }

        return arr;
      } else {
        return [{
          y: bar.key.metric,
          x0: 0,
          x1: d.values.metric
        }];
      }
    })
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("height", bar.y.rangeBand())
    .attr("fill", function(d) { return bar.z(d.y); })
    .attr("x", 0)
    .attr("width", 0)

    // We implement some animations
    // Delay 350, easing function quadratic
    .transition().ease("linear").duration(750)

    // The position of each of these bars are required
    // to be placed at y1 height due to the anchor of
    // a rect being at the top left corner
    .attr("x", function(d) { return bar.x(d.x0) })

    // Since the web coordinate system has a negative
    // increasing y-axix, y0 will yield a smaller numeric
    // value which in turn results in a higher pixel value
    .attr("width", function(d) { return bar.x(d.x1) - bar.x(d.x0) });


  bar.base.setState(BaseSVG.stateENUM.READY);

  return bar;
}

module.exports = XBar