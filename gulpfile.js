var gulp = require('gulp');
var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var when = require('when');
var jsyaml = require('js-yaml');
var fs = require('fs');

var deploy = require("gulp-gh-pages");
var static = require('node-static');

//
// Create a node-static server instance to serve the './public' folder
//
var file = new static.Server('./out');

function runServer() {
    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            file.serve(request, response);
        }).resume();
    }).listen(8000);
}


gulp.task('deploy', ['stylus', 'html', 'static'], function () {
    var remote = "https://github.com/gopilot/epa.git";

    return gulp.src("./out/**/*")
        .pipe( deploy( remote ) );
});

// compile css
gulp.task('stylus', function () {
    var promises = []
    promises.push(
        gulp.src('./css/master.styl')
            .pipe(stylus({use: ['nib']}))
            .pipe(gulp.dest('./out/css'))
    )
    promises.push(
        gulp.src('./css/confirmation.styl')
            .pipe(stylus({use: ['nib']}))
            .pipe(gulp.dest('./out/css'))
    )
    return when.all(promises)
});

// compile our HTML
gulp.task('html', function() {
    var locals = jsyaml.load(fs.readFileSync('./info.yaml', 'utf8')); // load yaml
    var promises = []
    
    promises.push(
        gulp.src('./index.jade')
            .pipe(jade({
                locals: locals
            }))
            .pipe(gulp.dest('./out'))
    );
    promises.push(
        gulp.src('./confirmation.jade')
            .pipe(jade({
                locals: locals
            }))
            .pipe(gulp.dest('./out'))
    );
    return when.all(promises)
});

gulp.task('default', function(){
    gulp.run('stylus');
    gulp.run('html');
});

// copy over everything from the static folder (images, etc)
// NOTE: into the root of the out folder
gulp.task('static', function(){
    return gulp.src('./static/**')
        .pipe(gulp.dest('./out'));
});

gulp.task('watch', function() {
    runServer();
    gulp.watch('./static/**', ['static']);
    gulp.watch('./css/*.styl', ['stylus']);
    gulp.watch(['./*.jade', './components/*.jade', './info.yaml'], ['html']);
});

