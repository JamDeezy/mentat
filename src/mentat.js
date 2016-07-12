require("./stylesheets/tooltip.scss");

// Libraries
var Choropleth = require('./lib/choropleth');
var Line = require('./lib/line');

function mentat(selector, type, opts) {

  // Mentat Visualization library
  switch(type) {

    // Choropleth - e.g https://bl.ocks.org/mbostock/4060606
    // A map that uses differences in shading, coloring, or the
    // placing of symbols within predefined areas to indicate
    // the average values of a property or quantity in those areas.
    case 'choropleth':
      return new Choropleth(
        selector,
        typeof opts.data === 'undefined' ? [] : opts.data,
        typeof opts.country === 'undefined' ? 'ca' : opts.country,
        typeof opts.key === 'undefined' ? {} : opts.key,
        opts.scale,
        opts.tooltip
      );

    // // TODO maybe should be histogram
    // case 'bar':

    // //
    // case 'line':
    //   return new Line(
    //     selector,
    //     opts.data,
    //     opts.key,
    //     opts.axis,
    //     opts.scale,
    //     opts.tooltip
    //   );

    default:
      console.warn(type + " is not implemented by mentat");
  }
}


// TODO
// 1) line graph
// 2) bar graph
// 3) update-able graphs
// 4) callback on click or hover


module.exports = mentat;