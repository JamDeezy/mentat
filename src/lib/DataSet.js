function DataSet(data, dimension, metric) {

  // Scope dis
  var ds       = this;
  ds.origData  = data,
  ds.dsData    = [],
  ds.metric    = metric,
  ds.dimension = dimension;

  // Find in dataset
  ds.findDs = function(key) {
    var dp = ds.dsData.find(function(d) {
      return d.key.toLowerCase() === key.toLowerCase();
    });

    return !dp ? undefined : {
      key: dp.key,
      value: dp.values.metric,
      src: dp.values.source
    }
  }

  // Find the extent of our data set after rollup
  // i.e [min, max] values for graphing purposes
  ds.extent = function(key) {
    return d3.extent(
      ds.dsData,
      function(d) {
        return d.values.metric;
      }
    );
  }

  // Roll up data set
  ds.dsData =
    d3.nest()
      .key(function(d) { return d[dimension].toLowerCase(); })
      .rollup(function(d) {
        return {
          metric: d3.sum(d, function(e) { return e[metric] }),
          dimension: d[0][dimension],
          source: d
        }
      })
      .entries(ds.origData);

  return ds;
}

module.exports = DataSet;