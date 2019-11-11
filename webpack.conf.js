var path = require('path');

// webpack.config.js
module.exports = {
    entry: './src/PrebidPluginCP.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'PrebidPluginCP.js',
        chunkFilename: '[chunkhash].js',
        library: 'PrebidPluginCP',
        libraryTarget: 'var'
    },

    plugins: [
    ],

    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }]
    },
    devtool: 'source-map',

    preprocessor: {

        baseDirectoryOrIncludes: '.',
        defines: {
            'foo': true,
            'bar': 1
        }
    },

    jscs: {
        'excludeFiles': [''],
        'disallowNewlineBeforeBlockStatements': true
    }
};
