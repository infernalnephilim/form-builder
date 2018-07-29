const path = require('path');
//const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "production",
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js']
    },
    devServer: {
        contentBase: './src',
        publicPath: '/dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Custom template',
            // Load a custom template (lodash by default see the FAQ for details)
            template: './src/template.html'
        })
        /*new BrowserSyncPlugin({
            // browse to http://localhost:3000/ during development,
            // ./public directory is being served
            host: 'localhost',
            port: 3000,
            server: { baseDir: ['output'] }
        })*/
    ],
    watch: true
};