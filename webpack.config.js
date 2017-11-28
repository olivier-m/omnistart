/* global __dirname, module, require */
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');


// Addon directory
const dest_dir = path.resolve(__dirname, 'addon');


// Make manifest.json out of package.json information
const package_json = require('./package.json');
const manifest_json = require('./webext-manifest.json');
manifest_json.version = package_json.version;
manifest_json.description = package_json.description;
manifest_json.author = package_json.author.name;


module.exports = {
  target: 'web',
  node: false,

  resolve: {
    alias: {
      'vue': 'vue/dist/vue.runtime.esm'
    }
  },

  entry: {
    'resources/dist/options': './src/browser/options.js',
    'resources/dist/app/main': './src/app/main.js'
  },

  output: {
    path: dest_dir,
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: true
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader']
        })
      },
      {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'stylus-loader']
        })
      },
      {
        test: /\.svg$/,
        loader: 'vue-svg-loader'
      }
    ]
  },

  plugins: [
    new ExtractTextPlugin('resources/dist/app/style.css'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new GenerateJsonPlugin('manifest.json', manifest_json, null, 2)
  ]
};
