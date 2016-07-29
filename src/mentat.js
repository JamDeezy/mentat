var moment = require("moment");

// Libraries
var Choropleth = require('./lib/Choropleth');
var Line = require('./lib/Line');
var Bar = require('./lib/Bar');

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

    // Bar Graph - http://bl.ocks.org/mbostock/3886208
    case 'bar':
      return new Bar(
        selector, key, data,
        opts.axis,
        opts.scale,
        opts.tooltip
      );

    default:
      console.warn(type + " is not implemented by mentat");
  }
}


// TODO
// - fix the difference between scale and coloring in bar/line
// - introduce modes into various visualizations
// - legend duh
// - axis object d3????
// - add click callback
// - finish other TODOs

// TODO tier 2
// http://www.visualcinnamon.com/babynamesus
// http://dataaddict.fr/prenoms/#christelle,christophe,carole,berengere,aurelie,isabelle,david,jean,michel,philippe
// http://bl.ocks.org/mbostock/3943967
// http://bl.ocks.org/mbostock/1256572
// Expand DataSet to fetch from ajax endpoint
// Work on updatable graph
module.exports = mentat;