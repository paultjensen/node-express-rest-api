module.exports = function(grunt) {

    // ===========================================================================
    // CONFIGURE GRUNT ===========================================================
    // ===========================================================================
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                reporter: require('jshint-stylish'),
                esversion: 6
            },
            build: ['Gruntfile.js',
                'app.js',
                'bin/**/*.js',
                'lib/**/*.js',
                'routes/**/*.js',
                'test/*.js'
            ]
        },

        mochaTest: {
            users: {
                options: {
                    reporter: 'spec',
                    quiet: false,
                    clearRequireCache: false,
                    timeout: 60000
                },
                src: ['test/**/api-users-tests.js']
            }
        },

        shell: {
            options: {
                stderr: false
            }
        }
    });

    // ===========================================================================
    // LOAD GRUNT PLUGINS ========================================================
    // ===========================================================================
    require('load-grunt-tasks')(grunt);

    // Default task(s).
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('inspect', ['jshint']);
    grunt.registerTask('test:all', ['mochaTest:users']);
    grunt.registerTask('test:users', ['mochaTest:users']);

};
