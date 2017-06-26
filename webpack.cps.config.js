var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var outputPath = path.resolve(__dirname, 'public/cps');

module.exports = {
    entry: {
        game: path.join(__dirname, 'src/game.ts'),
    },
    output: {
        filename: 'game.bundle.js',
        path: outputPath,
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
            phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
            p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js'),
            assets: path.join(__dirname, 'assets/')
        }
    },
    module: {
        rules: [{
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader'
            },
            {
                test: /assets(\/|\\)/,
                loader: 'file-loader?name=assets/[hash].[ext]'
            },
            {
                test: /pixi\.js$/,
                loader: 'expose-loader?PIXI'
            },
            {
                test: /phaser-split\.js$/,
                loader: 'expose-loader?Phaser'
            },
            {
                test: /p2\.js$/,
                loader: 'expose-loader?p2'
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: '/node_modules/'
            }
        ]
    },
    devServer: {
        contentBase: __dirname,
        compress: true,
        port: 9000,
        inline: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: true,
            ignored: /node_modules/
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: path.resolve(outputPath, 'index.html'),
            template: './templates/index.ejs',
            title: 'TypeScript Space Invaders Clone - CPS'
        }),
        new CleanWebpackPlugin([
            path.join(__dirname, 'dist')
        ]),
        new webpack.DefinePlugin({
            'DEBUG': false,
            'ASSETS_PATH': JSON.stringify("assets/images/"),
            'FONT_COLOR': JSON.stringify("#698e00"),
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            extractComments: true,
            screw_ie8: true
        }),
    ]
};