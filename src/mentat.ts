/// <reference path="dts/d3.d.ts"/>
/// <reference path="dts/require.d.ts"/>

module mentat {

  // Alphanumeric comparison
  // http://stackoverflow.com/questions/4340227
  export function alphanumCompare(a, b) {
    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;

    var aA = a.replace(reA, "");
    var bA = b.replace(reA, "");
    if (aA === bA) {
      var aN = parseInt(a.replace(reN, ""), 10);
      var bN = parseInt(b.replace(reN, ""), 10);
      return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
      return aA > bA ? 1 : -1;
    }
  }

  // Natural comparison
  export function naturalCompare(a, b) {
    var ax = [], bx = [];

    a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) {
      ax.push([$1 || Infinity, $2 || ""])
    });
    b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) {
      bx.push([$1 || Infinity, $2 || ""])
    });

    while (ax.length && bx.length) {
      var an = ax.shift();
      var bn = bx.shift();
      var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
      if (nn) return nn;
    }

    return ax.length - bx.length;
  }

  export function warn(str: string) {
    console.warn("MENTAT: " + str);
  }

  export function error(str: string) {
    throw "MENTAT: " + str
  }
}

// TODO
// API + documentation
// pagnation

// TODO dashboard
// deep linking state
// - move all of the required hash params into a single structure
// - find a way to convert that hash data into a string and then into a
//   hash id
// - perform auto start up query (+ loader) if hashid is legit, otherwise clear