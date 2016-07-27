// Equivalent to
// webpack ./entry.js bundle.js  --module-bind 'css=style!css'
var debug    = process.env.NODE_ENV !== "production";
var webpack  = require('webpack');
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
    d3: 'd3', moment: 'moment', topojson: 'topojson'
  }),
  new webpack.DefinePlugin({
    APP_PATH: JSON.stringify("/data/"),
    APP_VERSION: JSON.stringify("")
  })
] : [
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    sourcemap: false
  }),
  new webpack.ProvidePlugin({
    d3: 'd3', moment: 'moment', topojson: 'topojson'
  }),
  new webpack.DefinePlugin({
    APP_PATH: JSON.stringify("//s3.amazonaws.com/f.wishabi.ca/mentat/"),
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
  },{
    test: /\.scss$/,
    loaders: ["style", "css", "sass"]
  }]
};

// TODO jasmine tests