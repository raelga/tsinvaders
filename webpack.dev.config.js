var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        game:    path.join(__dirname, 'src/game.ts'),
    },
    output: {
        filename: 'game.bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
            phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
            p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js'),
        }
    },
    module: {
        rules: [
            { test: /\.ts$/, enforce: 'pre', loader: 'tslint-loader' },
            { test: /pixi\.js$/, loader: 'expose-loader?PIXI' },
            { test: /phaser-split\.js$/, loader: 'expose-loader?Phaser' },
            { test: /p2\.js$/, loader: 'expose-loader?p2' },
            { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' }
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
            filename: path.resolve(__dirname, 'index.html'),
            template: './templates/index.ejs',
            title: 'TypeScript Space Invaders Clone'
        }),
        new webpack.DefinePlugin({
            'DEBUG': false,
            'ASSETS_PATH': JSON.stringify("assets"),
            'FONT_COLOR': JSON.stringify("#fff"),
        }),
    ]
};