var path = require('path');
var pathToPhaser = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(pathToPhaser, 'dist/phaser.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    bundle: './src/game.ts',
    version: './src/version.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' },
      { test: /phaser\.js$/, loader: 'expose-loader?Phaser' },
      {
        test: /\.json$/,
        loader: 'json-loader',
        // exclude: '/node_modules/',
        include: path.resolve('.')
      },
      {
        test: /\.ya?ml$/,
        include: path.resolve('.'),
        loader: 'yaml-loader',
      }
    ],
  },
  devServer: {
    contentBase: path.resolve(__dirname, './'),
    publicPath: '/build/',
    host: '127.0.0.1',
    port: 5050,
    open: true
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      phaser: phaser
    }
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // ecma: undefined,
          // warnings: false,
          // parse: {},
          // compress: {},
          mangle: true, // Note `mangle.properties` is `false` by default.
          // module: false,
          // output: null,
          // toplevel: false,
          // nameCache: null,
          // ie8: false,
          // keep_classnames: undefined,
          // keep_fnames: false,
          // safari10: false,
        },
      }),
    ],
    usedExports: true,
  }
};
