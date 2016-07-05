// Equivalent to
// webpack ./entry.js bundle.js  --module-bind 'css=style!css'
var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var packjson = require('./package.json');

module.exports = {
  context: __dirname,
  entry: "./src/mentat.js",
  output: {
    filename: debug ? "./mentat.js" :  "./mentat.min.js",
    library: "mentat",
    libraryTarget: "var",
  }
}

// Plugins
module.exports.plugins = debug ? [
  new webpack.ProvidePlugin({
    topojson: 'topojson',
    d3: 'd3'
  }),
  new webpack.DefinePlugin({
    APP_PATH: JSON.stringify("//s3.amazonaws.com/f.wishabi.ca/development_ezdz/mentat/"),
    APP_VERSION: JSON.stringify(packjson.version)
  })
] : [
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    mangle: false, sourcemap:false
  }),
  new webpack.ProvidePlugin({
    topojson: 'topojson',
    d3: 'd3'
  }),
  new webpack.DefinePlugin({
    APP_PATH: JSON.stringify("//s3.amazonaws.com/f.wishabi.ca/development_ezdz/mentat/"),
    APP_VERSION: JSON.stringify(packjson.version)
  })
];

// Resolve
module.exports.resolve = {
  extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
}

// Modules
module.exports.module = {
  loaders: [{
    test: /\.jsx?$/,
    exclude: /(node_modules|bower_components)/,
    loader: 'babel-loader'
  }]
};