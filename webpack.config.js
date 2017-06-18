var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/game.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'awesome-typescript-loader'
        }]
    },
    watch: true,
    plugins: [
        new HtmlWebpackPlugin({
            file: './index.html',
            template: './templates/index.html'
        })
    ]
};