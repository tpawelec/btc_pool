/*
npm install grunt grunt-sass grunt-contrib-watch grunt-contrib-jshint grunt-contrib-uglify grunt-contrib-cssmin --save-dev
*/

module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'css/style.css': 'sass/style.sass'
                }
            }
        },
        jshint: {
            all: ['js/scripts.js']
        },
        uglify: {
            my_target: {
                files: {
                    'js/scripts.min.js': ['js/scripts.js']
                }
            }
        },
        cssmin: {
            target: {
                files: {
                    'css/style.min.css': ['css/style.css']
                }
            }
        },
        watch: {
            sass: {
                files: ['sass/style.sass'],
                tasks: ['sass']
            },
            jshint: {
                files: ['js/scripts.js'],
                tasks: ['jshint:all']
            },
            uglify: {
                files: ['js/scripts.js'],
                tasks: ['uglify']
            },
            cssmin: {
                files: ['css/style.css'],
                tasks: ['cssmin']
            }
        }

    });
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['sass', 'jshint', 'uglify', 'watch']);


};