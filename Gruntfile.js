module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        filename: 'ng-sharepoint',
        banner: ['/*',
            ' * <%= pkg.name %>',
            ' * <%= pkg.homepage %>',
            ' * <%= pkg.author.name %> - <%= pkg.author.company %>',
            ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
            ' * License: <%= pkg.license %>',
            ' */\n'
        ].join('\n'),

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            build: {
                //src: ['src/**/*.js', '!src/libs/**/*.js'],
                src: ['build/<%= pkg.name %>.js'],
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },

        concat: {
            options: {
                separator: '\n'
            },
            ngSharePoint: {
                src: [
                    'src/utils/**/*.js',
                    'src/camlhelper/**/*.js',
                    'src/sharepoint/ng-sharepoint.js',
                    'src/sharepoint/services/**/*.js',
                    'src/sharepoint/directives/**/*.js',
                    'src/sharepoint/filters/**/*.js',
                    'src/sharepoint/ng-sharepoint-formpage.js'
                ],
                dest: 'build/<%= pkg.name %>.js'
            }
        },

        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js', '!src/libs/**/*.js'],
            beforeconcat: ['src/**/*.js'],
            afterconcat: ['build/*.js'],
            options: {
                newcap: false //-> http://www.jshint.com/docs/options/#newcap
            }
        },

        html2js: {
            sharepoint: {
                options: {
                    // custom options, see below
                    module: 'ngSharePoint.templates',
                    base: './ui/sharepoint'
                },
                src: ['ui/sharepoint/templates/**/*.html'],
                dest: 'build/<%= pkg.name %>.sharepoint.templates.js'
            },
            bootstrap: {
                options: {
                    // custom options, see below
                    module: 'ngSharePoint.templates',
                    base: './ui/bootstrap'
                },
                src: ['ui/bootstrap/templates/**/*.html'],
                dest: 'build/<%= pkg.name %>.bootstrap.templates.js'
            }
        },

        copy: {
            tocdn: {
                expand: true,
                cwd: 'build/',
                src: '**',
                dest: '../jsdelivr/files/angular.ng-sharepoint/<%= pkg.version %>/',
                flatten: true,
                filter: 'isFile'
            },

            toServer: {
                files: [{
                    cwd: 'build/',
                    expand: true,
                    src: '**',
                    //dest: 'R:\\app-ngforms\\js\\ngSharePoint'
                    //dest: 'X:\\app\\ngSharepoint'
                    dest: 'U:\\app\\libs'
                }]
            }
        },

        ngdocs: {
            options: {
                dest: 'docs',
                scripts: ['angular.js'],
                html5Mode: false,
                startPage: '/api/ngSharePoint',
                title: "ng-SharePoint",
                image: "ui/logo-kaldeera.png",
                imageLink: "https://github.com/Kaldeera/ng-SharePoint",
                titleLink: "/api/ngSharePoint",
                bestMatch: true,
                /*
                analytics: {
                      account: 'UA-08150815-0',
                      domainName: 'kaldeera.com'
                },
                discussions: {
                      shortName: 'my',
                      url: 'http://www.kaldeera.com',
                      dev: false
                }
                */
            },
            /*
            tutorial: {
              src: ['documents/tutorials/*.ngdoc'],
              title: 'Tutorial'
            },
            */
            api: {
                src: ['src/**/*.js'],
                title: 'API Reference'
            }
        }

    });

    /*
      grunt.event.on('watch', function(action, filepath, target) {
      });
    */

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-ngdocs');


    // Default task(s).
    grunt.registerTask('default', ['ngdocs']);
    grunt.registerTask('build', ['jshint:all', 'concat:ngSharePoint', 'uglify', 'html2js:sharepoint']);
    grunt.registerTask('publishcdn', ['copy']);
    grunt.registerTask('debug', ['concat']);

    grunt.registerTask('documentation', ['ngdocs']);



    grunt.registerTask('publish-pages', 'Publish a clean build, docs, and sample to github.io', function() {
        promising(this,
            ensureCleanMaster().then(function() {
                shjs.rm('-rf', 'build');
                return system('git checkout gh-pages');
            }).then(function() {
                return system('git merge master');
            }).then(function() {
                return system('grunt ngdocs');
            }).then(function() {
                return system('git commit -a -m \'Automatic gh-pages build\'');
            }).then(function() {
                return system('git checkout master');
            })
        );
    });


    var exec = require('faithful-exec'),
        shjs = require('shelljs');

    function system(cmd) {
        grunt.log.write('% ' + cmd + '\n');
        return exec(cmd).then(function(result) {
            grunt.log.write(result.stderr + result.stdout);
        }, function(error) {
            grunt.log.write(error.stderr + '\n');
            throw 'Failed to run \'' + cmd + '\'';
        });
    }


    function ensureCleanMaster() {
        return exec('git symbolic-ref HEAD').then(function(result) {
            if (result.stdout.trim() !== 'refs/heads/master') throw 'Not on master branch, aborting';
            return exec('git status --porcelain');
        }).then(function(result) {
            if (result.stdout.trim() !== '') throw 'Working copy is dirty, aborting';
        });
    }


    function promising(task, promise) {
        var done = task.async();
        promise.then(function() {
            done();
        }, function(error) {
            grunt.log.write(error + '\n');
            done(false);
        });
    }

};
