var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin')

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/')
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
var pixi = path.join(phaserModule, 'build/custom/pixi.js')
var p2 = path.join(phaserModule, 'build/custom/p2.js')

module.exports = {
    entry: {
        game:   ['./src/game.ts'],
        vendor: ['pixi', 'p2', 'phaser']
    },
    output: {
        filename: 'game.bundle.js',
        pathinfo: true,
        path: path.resolve(__dirname, 'dist'),
        publicPath: './dist/'
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            'phaser': phaser,
            'pixi': pixi,
            'p2': p2
        }
    },
    module: {
        rules: [
            { test: /\.(t|j)sx?$/, use: { loader: 'awesome-typescript-loader' } },
            { test: /pixi\.js/, use: ['expose-loader?PIXI'] },
            { test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] },
            { test: /p2\.js/, use: ['expose-loader?p2'] }
        ]
    },
    watch: true,
    plugins: [
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, 'index.html'),
            template: './templates/index.html'
        }),
        new BrowserSyncPlugin({
            host: process.env.IP || 'localhost',
            port: process.env.PORT || 3000,
            server: {
                baseDir: ['./', './dist']
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.bundle.js'
        }),
    ]
};