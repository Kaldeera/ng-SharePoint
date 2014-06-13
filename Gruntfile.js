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
        src: ['src/*.js'],
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.js',
      }
    }
    
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('concat', ['concat']);

};
