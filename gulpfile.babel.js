import fs from 'fs'
import path from 'path'
import gulp from 'gulp'
import jade from 'gulp-jade'
import stylus from 'gulp-stylus'
import babel from 'gulp-babel'
import nib from 'nib'
import del from 'del'
import Crx from 'crx'
import packageInfo from './package'

gulp
  .task('jade', () => gulp
    .src('./app/pages/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('./app/pages/build'))
  )
  .task('stylus', () => gulp
    .src('./app/styles/*.styl')
    .pipe(stylus({
      use: nib(),
      compress: true,
      import: 'nib'
    }))
    .pipe(gulp.dest('./app/styles/build'))
  )
  .task('babel', () => gulp
    .src('./app/scripts/*.js?(x)')
    .pipe(babel())
    .pipe(gulp.dest('./app/scripts/build'))
  )
  .task('watch', () => {
    gulp.watch('./app/pages/*.jade', ['jade'])
    gulp.watch('./app/styles/*.styl', ['stylus'])
    gulp.watch('./app/scripts/*.js?(x)', ['babel'])
  })
  .task('cp', () => gulp
    .src([
      './node_modules/backbone/backbone.min.js',
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/lodash/lodash.min.js'
    ])
    .pipe(gulp.dest('./app/components'))
  )
  .task('default', ['cp', 'jade', 'stylus', 'babel', 'watch'])

gulp
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
