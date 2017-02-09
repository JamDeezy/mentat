require("../helpers/array.js")

function DataSet(data, dimension, metric) {
  // Scope dis
  var ds       = this;
  ds.origData  = data,
  ds.dsData    = [],
  ds.metric    = metric,
  ds.dimension = dimension;

  // Find in dataset
  ds.findDs = function(val) {
    var dp = ds.dsData.find(function(d) {
      return d.key.toLowerCase() === val.toLowerCase();
    });

    // Format the return using standardized
    // key/value/src properties
    return !dp ? undefined : {
      key: dp.key,
      value: dp.values.metric,
      src: dp.values.source
    }
  }

  // Find in dataset thats closest to key
  // http://stackoverflow.com/questions/26882631
  ds.findApproxDs = function(val) {
    var bisect = d3.bisector(function(d) { return d.key; })
    var index  = bisect.left(ds.dsData, val, 1);
    var d0     = ds.dsData[index - 1],
        d1     = ds.dsData[index];
        dp     = val - d0.key > d1.key - val ? d1 : d0;

    // Format the return using standardized
    // key/value/src properties
    return !dp ? undefined : {
      key: dp.key,
      value: dp.values.metric,
      src: dp.values.source
    }
  }

  // Find the extent of our data set after rollup
  // i.e [min, max] values for graphing purposes
  ds.extent = function(v) {
    if (v instanceof Function) {
      // Use callback
      return d3.extent(ds.dsData.map(function(d) {
        return v(d.values.source);
      }));

    } else if (v instanceof Array) {
      // Array needs some special handling
      var arr = ds.dsData.map(function(d) {
        return d.values.source.map(function(e) {
          return v.map(function(f) { return e[f] });
        })
      }).flatten();
      return d3.extent(arr)

    } else {
      // String
      var arr = ds.dsData.map(function(d) {
        return d.values.source.map(function(e) {
          return e[v];
        })
      }).flatten();
      return d3.extent(arr);
    }
  }


  // Need a transpose function for d3
  // TODO; should this return based on key or on metric
  // TODO; stacked graphs need a different format than this
  // which is actually good for grouped graphs
  ds.transpose = function(key) {
    if (key instanceof Array) {
      return key.map(function(d) {
        return {
          key: d,
          values: ds.origData.map(function(e) {
            return { key: e[dimension], value: e[d] };
          })
        }
      })
    } else {
      return [{
        key: key,
        values: ds.origData.map(function(d) {
          return { key: d[dimension], value: d[key] };
        })
      }]
    }
  }


  // Roll up data set
  ds.dsData =
    d3.nest()
      .key(function(d) { return d[dimension]; })
      .rollup(function(d) {
        // Detect multi-dimensional visualization
        // Store the metriccs in an array respective
        // to the input order
        if (metric instanceof Array) {
          return {
            metric: metric.map(function(e) {
              return d3.sum(d, function(f) { return f[e] });
            }),
            dimension: d[0][dimension],
            source: d
          };

        // Single dimensional visualization just requires summation
        } else {
          return {
            metric: d3.sum(d, function(e) { return e[metric] }),
            dimension: d[0][dimension],
            source: d
          };
        }
      })
      .entries(ds.origData)
      .map(function(d) {
        // Improve our quality of life by maintaining data type
        if (ds.origData[0][ds.dimension] instanceof Date)
          d.key = new Date(d.key);
        return d;
      });

  return ds;
}

module.exports = DataSet;