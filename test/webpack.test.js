/*
 * Configuration for webpack used by Karma.
 */

let webpack = require("webpack");
let path = require("path");
console.log(__dirname);
module.exports = {

  bail: true,

  devtool: 'inline-source-map',

  resolve: {
    extensions: ['.ts', '.js'],
  },

  // rules for how to load specific file types
  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: [
          {loader: 'ts-loader'}, // uses tsconfig.json
          'angular2-template-loader'
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader?attrs=false'
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'null-loader'
      }
    ]
  },

  plugins: [
    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /(ionic-angular)|(angular(\\|\/)core(\\|\/)@angular)/,
      root('./src'), // location of your src
      {} // a map of your routes
    )
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};

function root(localPath) {
  return path.resolve(__dirname, localPath);
}
