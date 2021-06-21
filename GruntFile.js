module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var jsAppFiles = 'src/app/**/*.js';
    var gruntFile = 'GruntFile.js';
    var jsFiles = [
        jsAppFiles,
        gruntFile,
        'profiles/**/*.js'
    ];
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html',
        'src/ChangeLog.html',
        'src/js/agrc_map.js'
    ];

    grunt.initConfig({
        clean: {
            build: ['dist']
        },
        connect: {
            main: {
                options: {
                    base: 'src'
                }
            }
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['*.html', 'images/*.*'],
                    dest: 'dist/'
                }]
            },
            localBuild: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: 'js/agrc_map.js',
                    dest: 'dist/'
                }]
            }
        },
        dojo: {
            prod: {
                options: {
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js']
                }
            },
            stage: {
                options: {
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js']
                }
            },
            options: {
                dojo: 'src/dojo/dojo.js',
                load: 'build',
                releaseDir: '../dist',
                require: 'src/app/run.js',
                basePath: './src'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            main: {
                src: jsFiles
            }
        },
        replace: {
            stage: {
                options: {
                    patterns: [{
                        match: 'build',
                        replacement: 'stage'
                    }]
                },
                files: [{cwd: 'src', expand: true, src: 'js/agrc_map.js', dest: 'dist/'}]
            },
            prod: {
                options: {
                    patterns: [{
                        match: 'build',
                        replacement: 'prod'
                    }]
                },
                files: [{cwd: 'src', expand: true, src: 'js/agrc_map.js', dest: 'dist/'}]
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                compress: {
                    drop_console: true,
                    passes: 2,
                    dead_code: true
                }
            },
            stage: {
                options: {
                    compress: {
                        drop_console: false
                    }
                },
                src: ['dist/dojo/dojo.js'],
                dest: 'dist/dojo/dojo.js'
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['**/*.js', '!proj4/**/*.js'],
                    dest: 'dist'
                }]
            }
        },
        watch: {
            src: {
                files: jsFiles.concat(otherFiles),
                options: { livereload: true },
                tasks: ['eslint']
            }
        }
    });

    grunt.registerTask('default', [
        'eslint',
        'connect',
        'watch'
    ]);
    grunt.registerTask('build-prod', [
        'clean:build',
        'replace:prod',
        'dojo:prod',
        'uglify:prod',
        'copy:main'
    ]);
    grunt.registerTask('build-stage', [
        'clean:build',
        'replace:stage',
        'dojo:stage',
        'uglify:stage',
        'copy:main'
    ]);
    grunt.registerTask('build-local', [
        'clean:build',
        'dojo:stage',
        'copy:localBuild',
        'copy:main'
    ]);
};
