var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'src/client/public');
var APP_DIR = path.resolve(__dirname, 'src/client/app');

module.exports = {
    // devtool: 'cheap-module-eval-source-map',

    entry: {
        '/index/index': APP_DIR + '/js/index.js',
        '/account/account': APP_DIR + '/js/account.js'
    },

    output: {
        path: BUILD_DIR,
        filename: '[name].bundle.js'
    },

    plugins: [
        new CleanWebpackPlugin(['public']),
        new HtmlWebpackPlugin({
            title: 'Output Management'
        })
    ],

    // devServer: {
    //     contentBase: './dist'
    // },

    resolve: {
        // resolve file extensions
        extensions: ['.jsx', '.js']
    },

    module: {
        rules: [{
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['es2015', { modules: false }]
                        ],
                        plugins: ['syntax-dynamic-import']
                    }
                }]
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            }, {
        test: /\.json$/,
        loader: 'json-loader',
      },
        ]
    },

};