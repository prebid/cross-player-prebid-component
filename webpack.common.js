var webpack = require('webpack');
var path = require('path');

var eslintStylishConfig = require('eslint-stylish-config');
var StringReplacePlugin = require('string-replace-webpack-plugin');

var buildProps = require('./webpack.properties.js');

var bannerOptions = {
    banner: function () {
        return buildProps.plugin.bannerText;
    },
    entryOnly: true,
    raw: false
}

module.exports = function (mode) {
    console.log('Exporting Common Config > mode: ' + mode);

    var config = {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    enforce: 'pre',
                    include: [
                        path.resolve(__dirname, 'src'),
                        path.resolve(__dirname, 'test'),
                    ],
                    loader: 'eslint-loader',
                    options: {
                        formatter: eslintStylishConfig,
                        emitError: true,
                        failOnError: true,
                    }
                },
                /* {
                    test: /\.js$/,
                    use: {
                      loader: 'babel-loader',
                      options: {
                        presets: ['es2015']
                      }
                    }
                } */
            ]
        },
        plugins: [
            new StringReplacePlugin(),
            new webpack.BannerPlugin(bannerOptions)
        ]
    };

    return config;
};
