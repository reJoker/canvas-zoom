var webpack = require('webpack');
module.exports = {
    entry: {
        bundle: './example/app.js',
    },
    output: {
        filename: '[name].js',
        path: './example/assets'
    },
    /*
    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: false})
    ]
    */
}
