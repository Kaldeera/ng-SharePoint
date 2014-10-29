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
              ' */\n'].join('\n'),

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      build: {
        src: 'src/**/*.js',
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
      },
      formsEditor: {
        src: [
          'forms-editor/src/ng-sharepoint-formseditor.js',
          'forms-editor/src/directives/**/*.js',
          'forms-editor/src/ng-sharepoint-formseditor-bootstrap.js'
        ],
        dest: 'build/<%= pkg.name %>.forms-editor.js'
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', '!src/libs/**/*.js', 'forms-editor/src/**/*.js'],
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
      },

      editor: {
        options: {
          module: 'ngSharePointFormsEditor.templates',
          base: './forms-editor/ui'
        },
        src: ['forms-editor/ui/templates/**/*.html'],
        dest: 'build/<%= pkg.name %>.forms-editor.templates.js'
      }
    },

    watch: {
      scripts: {
        files: ['**/*.js'],
        tasks: ['default'],
        options: {
          spawn: false,
        },
      },
      configFiles: {
        files: [ 'Gruntfile.js'],
        options: {
          reload: true
        }
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
          files: [
            {
              cwd: 'build/',
              expand: true,
              src: '**',
              //dest: 'R:\\app\\kld-testforms\\js'
              dest: 'X:\\app\\ngSharepoint'
            }
          ]
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['jshint:all', 'uglify', 'concat:ngSharePoint', 'html2js:sharepoint', 'copy:toServer']);
  grunt.registerTask('publishcdn', ['copy']);
  grunt.registerTask('debug', ['concat']);

};
