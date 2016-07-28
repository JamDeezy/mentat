var d3 = require('d3')
require("../stylesheets/tooltip.scss");

// tip library
// - bind to base svg?
//   + gets position respect to base
//     + allows automatic orientation detection
// - bind to dataset?
//   + gets the data based on what we're looking at
//   ? is that even possible?

function Tooltip(parent, html) {
  // Scoped
  var tip      = this;
  tip.parent   = d3.select(parent),
  tip.html     = html;

  // Create our div node!
  // NOTE: we append to parent, which is not
  // the svg, as svg's cannot render <div>'s
  tip.div = tip.parent
    .append("div")
    .classed("tip n", true)
    .style("opacity", 0);

  // TODO?
  tip.place = function(pos) {
    // Find out position and then check direction
    var adjustedPos = adjustpos.apply(this,[pos]);
    tip.div.style("left", adjustedPos[0] + "px")
      .style("top", adjustedPos[1] + "px");
  }

  //
  tip.show = function(data) {
    // Fill our tip by applying our callback
    var str = tip.html.apply(this, [data]);
    if (str) tip.div.html(str);

    // Locate and place our tooltip
    tip.div.transition()
      .duration(300)
      .style("opacity", 1);

    var position = d3.mouse(this)
    tip.place.apply(this,[position]);
  }

  //
  tip.hide = function() {
    tip.div.transition()
      .duration(300)
      .style("opacity", 0);
  }

  // Proxy attr calls to the tooltip div.
  tip.attr = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return tip.div.attr(n);
    } else {
      return tip.div.attr(n, v);
    }
  }

  // Proxy style calls to the tooltip div.
  tip.style = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return tip.div.style(n);
    } else {
      return tip.div.style(n, v);
    }
  }

  // Adjust the position of input coordinates
  // based on container [w,h] and tooltip [w,h]
  // Breakdown:
  //     Q4  |  Q1
  //         |
  //    ----pos----
  //         |
  //     Q3  |  Q2
  // NOTE:
  // Unfortunately the web doesn't work like math
  // Q3 is not the double negative quadrant since
  // our y-axis increases downwards, aka our origin
  // is in the top left hand corner.
  function adjustpos(pos) {
    var div = tip.div.node()
      .getBoundingClientRect();

    var svg = tip.parent.select('svg').node()
      .getBBox();

    var svgh = svg.height,
        svgw = svg.width,
        divh = div.height,
        divw = div.width,
        x    = pos[0],
        y    = pos[1],
        p    = [x - divw, y];

    // By default, the tooltip will appear in
    // Q3. If there isn't enough space in Q3 for the
    // tooltip, we shift the pos til there is
    if (x - divw < 0)    p[0] += divw;
    if (y        > svgh) p[1] -= divh;

    return p;
  }

  return tip;
}

module.exports = Tooltip;
