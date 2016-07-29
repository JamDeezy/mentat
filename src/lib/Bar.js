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

function Bar(selector, data, key, axis, scale, tooltip) {
  // Scope our variables
  var bar     = this;
  bar.base    = new BaseSVG(selector, 'bar'),
  bar.dataSet = new DataSet(data, key.dimension, key.metric),
  bar.key     = key,
  bar.scale   = scale,
  bar.tooltip = tooltip,
  bar.x = (bar.scale && bar.scale.x) ?
          bar.scale.x : d3.scale.ordinal(),
  bar.y = (bar.scale && bar.scale.y) ?
          bar.scale.y : d3.scale.linear();
  bar.z = d3.scale.ordinal();


  // Colors
  // TODO, we could refactor graph objects
  // (i.e. axes, stroke) into another class
  bar.stroke = function(d) {
    // If its a function, we assume they passed in a d3 function
    if (bar.scale instanceof Function) {
      return bar.scale(d);

    // Compute a function that would map metrics to colors
    // in the user defined array. NOTE: we're reinstanciating
    // this function at every call... Bad?
    } else if (bar.scale instanceof Array) {
      return d3.scale.ordinal()
        .range(bar.scale)
        .domain(bar.key.metric)(d);

    // Return our own default colors
    } else {
      return d3.scale.ordinal()
        .range(DEFCOLORS)
        .domain(bar.key.metric)(d);
    }
  }


  // Axis
  bar.axis = function(key, scale) {
    // If they provide a function, we assume
    // its a d3 axis object.
    if (bar.axis[key] instanceof Function) {
      return bar.axis[key]

    // If the value is a hash, we'll create the d3 object
    // based on the keys that are specified
    } else if (bar.axis[key] instanceof Object) {
      var axis = d3.svg.axis()
        .orient(bar.axis[key].orient)
        .scale(scale);

      if (typeof bar.axis[key].ticks !== 'undefined')
        axis.ticks(bar.axis[key].ticks);
      if (typeof bar.axis[key].tickFormat != 'undefined')
        axis.tickFormat(bar.axis[key].tickFormat);
      if (typeof bar.axis[key].tickPadding != 'undefined')
        axis.tickPadding(bar.axis[key].tickFormat);
      if (typeof bar.axis[key].tickSize != 'undefined')
        axis.tickSize(meta.tickSize);

      return axis;

    // Default axis
    } else {
      return d3.svg.axis()
        .orient((key === 'x') ? 'bottom' : 'left')
        .scale(scale);
    }
  }


  // Tooltip
  var html = function(d) {
    // Conform to format :)
    var dp  = bar.dataSet.findDs(d.key);

    // We calculate the x/y position of the tooltip
    var x   = bar.x(d.key) + bar.x.rangeBand() / 2,
        y   = bar.y(d3.sum(dp.value));

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

  // Configure the X axis (independent variable)
  bar.x.rangeRoundBands([0, bar.base.width], .08)
    .domain(bar.dataSet.origData.map(function(d) {
      return d[bar.key.dimension]
    }));

  bar.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + bar.base.height + ")")
    .call(bar.axis('x', bar.x));

  // Configure the Y axis (dependent variable[s])
  // We want to sum up all the metrics for a stacked
  // bar graph
  var yxtent = bar.dataSet.extent(function(d) {
    var sum = 0;
    for (var i = 0, sum = 0;
         i < bar.key.metric.length; i++) {
      sum += d[0][bar.key.metric[i]];
    }
    return sum;
  })

  // Scale by 10% to give some vertical room
  // Bottom should be 0
  bar.y.range([bar.base.height, 0])
    .domain([0, yxtent[1] * 1.1]);

  bar.svg.append("g")
    .attr("class", "y axis")
    .call(bar.axis('y', bar.y));

  bar.z.range(DEFCOLORS)
    .domain(bar.key.metric);


  // Create an array of svg stacks
  // which are the parent <g> elements that will
  // hold each individual rect
  var stack = bar.svg.selectAll(".stack")
    .data(bar.dataSet.dsData)
    .enter()
    .append("g")
    .attr("class", "stack")
    .attr("transform", function(d) {
      return "translate("+bar.x(d.key)+",0)"
    })
    .on("mouseout", bar.tip.hide)
    .on("mousemove", bar.tip.show);


  // Separate each stack of bars into
  // individual bars so we can color and stack
  stack.selectAll("rect")
    .data(function(d) {
      var keys = bar.key.metric,
          arr  = [],
          sum  = 0;

      // We want to create an array of stacking bars,
      // aka: bar1.y1 = bar2.y0 && bar2.y1 = bar3.y0
      for (var i = 0; i < keys.length; i++) {
        arr.push({
          x: keys[i],
          y0: sum,
          y1: sum += d.values.metric[i]
        });
      }

      return arr;
    })
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("width", bar.x.rangeBand())
    .attr("fill", function(d) { return bar.z(d.x); })
    .attr("y", bar.base.height)
    .attr("height", 0)

    // We implement some animations
    // Delay 350, easing function quadratic
    .transition().delay(350).ease("quad")

    // The position of each of these bars are required
    // to be placed at y1 height due to the anchor of
    // a rect being at the top left corner
    .attr("y", function(d) { return bar.y(d.y1) })

    // Since the web coordinate system has a negative
    // increasing y-axix, y0 will yield a smaller numeric
    // value which in turn results in a higher pixel value
    .attr("height", function(d) { return bar.y(d.y0) - bar.y(d.y1) });


  bar.base.setState(BaseSVG.stateENUM.READY);

  return bar;
}

module.exports = Bar