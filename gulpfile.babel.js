import fs from 'fs'
import path from 'path'
import gulp from 'gulp'
import Crx from 'crx'
import _ from 'lodash'
import webpack from 'webpack'
import gWebpack from 'gulp-webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import packageInfo from './package'

const webpackConfig = {
  entry: {
    popup: [
      './src/pages/popup.jade',
      './src/styles/popup.styl',
      './src/scripts/popup.jsx'
    ],
    devdocs: [
      './devdocs/assets/stylesheets/application.css.scss'
    ],
    'devdocs-dark': [
      './devdocs/assets/stylesheets/application-dark.css.scss'
    ],
    options: [
      './src/pages/options.jade',
      './src/styles/options.styl',
      './src/scripts/options'
    ],
    background: [
      './src/scripts/background.js'
    ]
  },
  module: {
    loaders: [{
      test: /\.jade$/,
      loader: ExtractTextPlugin.extract('raw', ['html', 'jade-html'])
    }, {
      test: /\.styl$/,
      loaders: ['style?sourceMap', 'css?sourceMap', 'stylus?sourceMap']
    }, {
      test: /\.scss$/,
      loaders: ['style?sourceMap', 'css?sourceMap', 'sass?sourceMap']
    }, {
      test: /\.jsx$/,
      loader: 'babel',
      query: {
        cacheDirectory: true,
        presets: ['react', 'es2015']
      }
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        cacheDirectory: true,
        presets: ['es2015']
      }
    }, {
      test: /\.min\.js$/,
      include: /node_modules/,
      loader: 'script'
    }]
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].bundle.js'
  },
  stylus: {
    import: '~nib/index.styl'
  }
}

gulp
  .task('default', function (cb) {
    return gulp.src([])
      .pipe(gWebpack(_.merge(webpackConfig, {
        watch: true,
        devtool: 'eval',
        plugins: [
          new ExtractTextPlugin('[name].html')
        ]
      })))
      .pipe(gulp.dest('./app/build'))
  })
  .task('release', function (cb) {
    return gulp.src([])
      .pipe(gWebpack(_.merge(webpackConfig, {
        devtool: false,
        plugins: [
          new ExtractTextPlugin('[name].html'),
          new webpack.optimize.UglifyJsPlugin({
            comments: false,
            mangle: true,
            compress: {
              warnings: false
            }
          })
        ]
      })))
      .pipe(gulp.dest('./app/build'))
  })
  .task('prepack', () => gulp
      .src(['./app/**/*', '!./app/**/*.styl', '!./app/**/*.jade'])
      .pipe(gulp.dest('./crx'))
  )
  .task('pack', ['prepack'], () => {
    const crx = new Crx({
      rootDirectory: './crx',
      privateKey: fs.readFileSync('crx.pem').toString()
    })

    crx
      .load()
      .then(() => crx.loadContents())
      .then(archiveBuffer => fs.writeFile(path.join(
          __dirname,
          `v${packageInfo.version}.zip`), archiveBuffer))
      .then(archiveBuffer => crx.pack(archiveBuffer))
      .then(crxBuffer => fs.writeFile(path.join(
          __dirname,
          `v${packageInfo.version}.crx`), crxBuffer)
    )
      .catch(e => console.error(e))
  })
