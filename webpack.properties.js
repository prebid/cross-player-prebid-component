var fs = require('fs');
var path = require('path');

// For build comments at top of file
var pkg = require('./package.json');

var versionText = 'v' + pkg.version;

var licenseHeaders = fs.readFileSync('license-cp-prebid.txt');

var curDateObj = new Date();

var copyrightText = '(c)' + curDateObj.getUTCFullYear() + ' PREBID.ORG, INC.';

var pluginBannerText = copyrightText + ' ' + versionText + '\n' + licenseHeaders;

var PROPS = {

    MODE_DEVELOPMENT: 'development',
    MODE_PRODUCTION: 'production',

    /* SHARED PROPERTIES */

    output: {
        path: path.join(__dirname, 'dist')
    },

    // 'devTool' sets the type of source maps used - see docs here: https://webpack.js.org/configuration/devtool
    devTool: {
        development: 'eval-source-map',
        production: 'none',
    },

    /* PLUGIN PROPERTIES */

    plugin: {
        entry_file: './src/PrebidPluginCP.js',
        output_file: {
            development: 'PrebidPluginCP.js',
            production: 'PrebidPluginCP.min.js',
        },
        libraryTarget: 'var',
        var_name: 'PrebidPluginCP',
        bannerText: pluginBannerText
    },

    /* UTIL FUNCTIONS */

    util: {
        traceObj: function (obj, depth) {
            depth = depth || 0;
            var space = new Array(depth + 2).join('==') + '> ';
            for (var k in obj) {
                console.log(space + k + ' --> ' + obj[k]);
                if (typeof obj[k] === 'object') {
                    traceObj(obj[k], depth + 1);
                }
            }
        }
    }
};

module.exports = PROPS;
