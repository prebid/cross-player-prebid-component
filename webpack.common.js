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
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options:
                        {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        },
        plugins: [
            new StringReplacePlugin(),
            new webpack.BannerPlugin(bannerOptions)
        ]
    };

    return config;
};
