// Equivalent to
// webpack ./entry.js bundle.js  --module-bind 'css=style!css'
var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');

module.exports = {
  context: __dirname,
  devtool: debug ? 'inline-sourcemap' : null,
  entry: "./src/mentat.ts",
  output: {
    filename: debug ? "./lib/mentat.js" :  "./lib/mentat.min.js"
  }
}

// Plugins
module.exports.plugins = debug ? [] : [
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    mangle: false, sourcemap:false
  }),
];

// Resolve
module.exports.resolve = {
  extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
}

// Modules
module.exports.module = {
  loaders: [
    // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
    { test: /\.tsx?$/, loader: 'ts-loader' }
  ]
};