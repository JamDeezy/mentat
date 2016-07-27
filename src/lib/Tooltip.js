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
  var tip     = this;
  tip.parent  = d3.select(parent)
  tip.html    = html;

  //
  tip.node = tip.parent
    .append("div")
    .classed("tip n", true)
    .style("opacity", 0);


  //
  tip.show = function(data) {
    var position = d3.mouse(this)

    tip.node.transition()
      .duration(300)
      .style("opacity", 1);

    // TODO find out position and then check direction
    tip.node.style("left", position[0] + "px")
      .style("top", position[1] + "px");

    // Fill our tip by applying our callback
    // TODO should we do this before or after to position ourselves
    var str = tip.html.apply(this, [data]);
    tip.node.html(str);
  }


  //
  tip.hide = function() {
    tip.node.transition()
      .duration(300)
      .style("opacity", 0);
  }


  // Proxy attr calls to the tooltip node.
  tip.attr = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return tip.node.attr(n);
    } else {
      return tip.node.attr(n, v);
    }
  }

  // Proxy style calls to the tooltip node.
  tip.style = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return tip.node.style(n);
    } else {
      return tip.node.style(n, v);
    }
  }

  // tip.direction = function() {
  // }

  // tip.offset = function() {
  // }


  // tip.show = function() {
  //     var args = Array.prototype.slice.call(arguments)
  //     if(args[args.length - 1] instanceof SVGElement) target = args.pop()

  //     var content = html.apply(this, args),
  //         poffset = offset.apply(this, args),
  //         dir     = direction.apply(this, args),
  //         nodel   = d3.select(node),
  //         i       = directions.length,
  //         coords,
  //         scrollTop  = document.documentElement.scrollTop || document.body.scrollTop,
  //         scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft

  //     nodel.html(content)
  //       .style({ opacity: 1/*, 'pointer-events': 'all' */})

  //     while(i--) nodel.classed(directions[i], false)
  //     coords = direction_callbacks.get(dir).apply(this)
  //     nodel.classed(dir, true).style({
  //       top: (coords.top +  poffset[0]) + scrollTop + 'px',
  //       left: (coords.left + poffset[1]) + scrollLeft + 'px'
  //     })

  //     return tip
  //   }

  //   // Public - hide the tip
  //   //
  //   // Returns a tip
  //   tip.hide = function() {
  //     var nodel = d3.select(node)
  //     nodel.style({ opacity: 0, 'pointer-events': 'none' })
  //     return tip
  //   }

  return tip;
}

module.exports = Tooltip;
