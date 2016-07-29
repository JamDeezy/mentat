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


  // Render our tooltip in the scope
  // of whatever element we're bound to.
  tip.show = function(data) {
    var ret = tip.html.apply(this, [data]);

    // Fill our tip by applying our callback
    // Also apply position if we got an array
    if (ret instanceof Array) {
      tip.div.html(ret[0]);
      place.apply(this, [ret[1]]);
    } else {
      var position = d3.mouse(this)

      tip.div.html(ret);
      place.apply(this,[position]);
    }

    // Set visible
    tip.div.transition()
      .duration(150)
      .style("opacity", 1);
  }


  // Hide our tooltip
  // by reducing opacity to 0
  tip.hide = function() {
    tip.div.transition()
      .duration(150)
      .style("opacity", 0);
  }


  // Place the tooltip, while adjusting
  // the position of input coordinates
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
  function place(pos) {
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
    if (y + divh > svgh) p[1] -= divh;

    // Place
    tip.div.style("left", p[0] + "px")
      .style("top", p[1] + "px");
  }


  // Create our div node!
  // NOTE: we append to parent, which is not
  // the svg, as svg's cannot render <div>'s
  tip.div = tip.parent
    .append("div")
    .classed("tip n", true)
    .style("opacity", 0);

  return tip;
}

module.exports = Tooltip;
