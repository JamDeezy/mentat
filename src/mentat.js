require("./stylesheets/tooltip.scss");

// Libraries
var Choropleth = require('./lib/Choropleth');
var Line = require('./lib/Line');

function mentat(selector, type, key, data, opts) {

  // We want to make sure all our required components
  // are available
  if (typeof selector === 'undefined')
    throw "Mentat: A valid selector is required.";
  if (typeof type === 'undefined')
    throw "Mentat: Pick a visualization type.";
  if (typeof key === 'undefined')
    throw "Mentat: Need a dimension/metric definition in key."
  if (typeof data === 'undefined')
    throw "Mentat: Missing data."
  if (data.length < 1)
    throw "Mentat: Data array is empty"


  // Mentat Visualization library
  switch(type) {

    // Choropleth - e.g https://bl.ocks.org/mbostock/4060606
    // A map that uses differences in shading, coloring, or the
    // placing of symbols within predefined areas to indicate
    // the average values of a property or quantity in those areas.
    case 'choropleth':
      return new Choropleth(
        selector, key, data,
        typeof opts.country === 'undefined' ? 'ca' : opts.country,
        opts.scale,
        opts.tooltip
      );

    // Line Graph - http://bl.ocks.org/mbostock/3884955
    case 'line':
      return new Line(
        selector, key, data,
        opts.axis,
        opts.scale,
        opts.tooltip
      );


    // // TODO maybe should be histogram
    // case 'bar':

    default:
      console.warn(type + " is not implemented by mentat");
  }
}


// TODO
// 1) line graph
// 2) bar graph
// 3) add click callback
// 4) update-able graphs
// 5) callback on click or hover

// *) helpers => extensions

// tier 2
// http://www.visualcinnamon.com/babynamesus
// http://dataaddict.fr/prenoms/#christelle,christophe,carole,berengere,aurelie,isabelle,david,jean,michel,philippe
module.exports = mentat;