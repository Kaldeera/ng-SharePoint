module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    filename: 'kld-ngsharepoint',
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
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.min.js'
      }
    },

    concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.debug.js'
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js'],
      beforeconcat: ['src/**/*.js'],
      afterconcat: ['build/*.js']
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
    }
    
  });

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln('yea!: ' + target + ': ' + filepath + ' has ' + action);
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['jshint:all', 'uglify', 'concat']);
  grunt.registerTask('debug', ['concat']);

};
