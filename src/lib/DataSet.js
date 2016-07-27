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
    var bisect = d3.bisector(function(d) {
        return (val instanceof Date) ? new Date(d.key) : d.key
      })
    var dp = ds.dsData[bisect.left(ds.dsData, val, 1)]

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
  // @key - the key value of the vlaue we're grabbing
  // TODO; should this return multi key entent or summed
  ds.extent = function(key) {
    var arr = ds.dsData.map(function(d) {
      if (key instanceof Array) {
        return d.values.source.map(function(e) {
          return key.map(function(f) { return e[f] });
        })
      } else {
        return d.values.source.map(function(e) {
          return e[key]
        })
      }
    }).flatten();

    return d3.extent(arr);
  }


  // Need a transpose function for d3
  // TODO; should this return based on key or on metric
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
      return {
        key: key,
        values: ds.origData.map(function(d) {
          return { key: d[dimension], value: d[key] };
        })
      }
    }
  }


  // Roll up data set
  ds.dsData =
    d3.nest()
      .key(function(d) {
        return d[dimension] instanceof Date ?
          d[dimension] : d[dimension].toLowerCase();
      })
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
      .entries(ds.origData);

  return ds;
}

module.exports = DataSet;