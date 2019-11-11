var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var rename = require('gulp-rename');
var header = require('gulp-header');

var gulpWebpack = require('gulp-webpack');
var webpackConfig = require('./webpack.conf.js');

var path = require('path');
var Server = require('karma').Server;

var cp = require('child_process');

var eslint = require('gulp-eslint');

var pkg = require('./package.json');

var curVersion = pkg.version;

var versionText = 'v' + curVersion;

var curDateObj = new Date();

var copyrightText = '(c)' + curDateObj.getUTCFullYear() + ' Xandr';

var bannerText = '/*! ' + copyrightText + ' ' + versionText + '*/\n';

gulp.task('webpack:build', function(_callback) {
    return gulpWebpack(require('./webpack.conf.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('webpack:build-min', function(_callback) {
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
       minimize: false,
      sourceMap: false
    }));
    return gulpWebpack(webpackConfig)
       .pipe(header(bannerText))
       .pipe(rename({suffix: '.min'}))
       .pipe(gulp.dest('dist/'));
});

gulp.task('lint', () => {
    return gulp.src(['src/**/*.js', 'tests/e2e/auto/**/*.js'])
      .pipe(eslint())
      .pipe(eslint.format('stylish'))
      .pipe(eslint.failAfterError());
});

gulp.task('test', function () {
    // eslint-disable-next-line handle-callback-err
    return cp.execFile('./test.sh', function(error, stdout, stderr) {
        console.log(stdout);
    });
});

gulp.task('dev-server', function(_callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.devtool = 'eval';
    myConfig.debug = true;

    // Start a webpack-dev-server
    // note- setting "publicPath" to /dist/ hides the actual
    // dist folder.  When webpack-dev-server runs, it does a webpack build
    // of the module in memory, not on disk into /dist/  This allows us to do live-rebuilds duing development time
    // to build to the actual dist folder, you need to run the webpack gulp task
    // note that the pages in the testPages folder point to ../../../dist/ModuleName.js
    // this is so they can run standalone outside of the webpack dev server, and when webpack-dev-server server the file
    // moving up levels doesn't matter because we are already at the webserver root
    new WebpackDevServer(webpack(myConfig), {
        publicPath: '/dist/',
        contentBase: './tests/e2e/testPages/',
        hot: true,
        devtool: 'source-map',
        stats: {
            colors: true
        }
    }).listen(8082, 'local.prebid', function(err) {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'Webpack Dev Server Started at: http://local.prebid:8082/webpack-dev-server/');
    });
});

gulp.task('ci-test', function (done) {
    console.log('DIRNAME = ', __dirname);
    new Server({
        configFile: path.join(__dirname, 'karma.conf.ci.js'),
        autoWatch: false,
        singleRun: true,
        browsers: ['Chrome_travis_ci'],
        reporters: ['spec', 'coverage'],
        customLaunchers: {
          Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
          }
        },
        coverageReporter: {
            reporters: [
            {
                type: 'text',
                dir: 'coverage/',
                file: 'coverage.txt'
            },
            {
                type: 'html',
                dir: 'coverage/'
            },
            {
                type: 'lcovonly',
                dir: 'coverage/',
                subdir: '.'
            },
            {type: 'text-summary'}
            ]
        }
        }, function (error) {
        done(error);
      }).start();
});

gulp.task('default', ['lint', 'webpack:build', 'webpack:build-min', 'test']);

gulp.task('test', function () {
    return cp.execFile('./test.sh', function(_error, stdout, _stderr) {
        console.log(stdout);
    });
});
