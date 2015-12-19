import fs from 'fs'
import path from 'path'
import gulp from 'gulp'
import Crx from 'crx'
import webpack from 'gulp-webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import packageInfo from './package'

gulp
  .task('default', function (cb) {
    return gulp.src([])
      .pipe(webpack({
        entry: {
          popup: [
            './src/pages/popup.jade',
            './src/styles/popup.styl',
            './src/scripts/popup'
          ],
          readme: [
            './src/pages/readme.jade',
            './src/styles/readme.styl',
            './src/scripts/readme'
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
            loader: ExtractTextPlugin.extract('style', ['css', 'stylus'])
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
          filename: '[name].js'
        },
        watch: true,
        plugins: [
          new ExtractTextPlugin('[name].css'),
          new ExtractTextPlugin('[name].html')
        ]
      }))
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
