/* jshint node: true */
module.exports = function (grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      javascript: {
        src: [
          'src/js/ztesoft.js',
          'src/js/header.js',
          'src/js/frm/*.js',
          'src/js/*.js'
        ],
        dest: 'www/js/index.js'
      },
      template: {
        src: [
          'src/tpl/prefix.html',
          'src/tpl/*.html',
          '!src/tpl/suffix.html',
          'src/tpl/suffix.html'
        ],
        dest: 'www/index.html'
      },
      css: {
        src: [
          'src/css/global.css',
          'src/css/*.css'
        ],
        dest: 'www/css/index.css'
      }
    },

    watch: {
      javascript: {
        files: [
          'src/js/*.js'
        ],
        tasks: ['concat:javascript']
      },
      template: {
        files: [
          'src/tpl/*.html'
        ],
        tasks: ['concat:template']
      },
      css: {
        files: [
          'src/css/*.css'
        ],
        tasks: ['concat:css']
      }
    },

    inline: {
      options: {
        cssmin: true,
        uglify: true,
        tag: ''
      },
      dist: {
        src: ['www/index.html'],
        dest: ['www/index-inline.html']
      }
    },

    sed: {
      version: {
        path: 'www/js/index.js',
        pattern: '@PACKAGE_TIME',
        replacement: '' + (new Date()).getTime()
      }
    }

  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-sed');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'sed']);
};