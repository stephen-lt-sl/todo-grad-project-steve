module.exports = function(grunt) {

    var fs = require("fs");

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-mocha-istanbul");

    var testOutputLocation = process.env.CIRCLE_TEST_REPORTS || "test_output";
    var artifactsLocation = "build_artifacts";
    grunt.initConfig({
        jshint: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "public/**/*.js"],
            options: {
                jshintrc: true
            }
        },
        jscs: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "public/**/*.js"]
        },
        mochaTest: {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    reporter: "xunit",
                    captureFile: testOutputLocation + "/mocha/results.xml",
                    quiet: true
                }
            }
        },
        "mocha_istanbul": {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    quiet: true
                }
            },
            options: {
                coverageFolder: artifactsLocation,
                reportFormats: ["none"],
                print: "none"
            }
        },
        "istanbul_report": {
            test: {

            },
            options: {
                coverageFolder: artifactsLocation
            }
        },
        "istanbul_check_coverage": {
            test: {

            },
            options: {
                coverageFolder: artifactsLocation,
                check: {
                    lines: 100,
                    statements: 100,
                    branches: 100,
                    functions: 100
                }
            }
        }
    });

    grunt.registerMultiTask("istanbul_report", "Solo task for generating a report over multiple files.", function () {
        var done = this.async();
        var cmd = process.execPath;
        var istanbulPath = require.resolve("istanbul/lib/cli");
        var options = this.options({
            coverageFolder: "coverage"
        });
        grunt.util.spawn({
            cmd: cmd,
            args: [istanbulPath, "report", "--dir=" + options.coverageFolder]
        }, function(err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    grunt.registerTask("serve", "Task that runs the server.", function () {
        var done = this.async();
        var cmd = process.execPath;
        grunt.util.spawn({
            cmd: cmd,
            args: ["server.js"]
        }, function(err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    grunt.registerTask("watch", "Task that runs the server and restarts it if server files are changed.", function () {
        var done = this.async();
        var cmd = process.execPath;
        var restartOnNextDeath = false;
        var serverProc;
        var serverWatcher;
        // Restarts the server if `restartOnNextDeath` is true, otherwise end the task normally
        var onServerDeath = function(err) {
            if (restartOnNextDeath) {
                restartOnNextDeath = false;
                serverProc = grunt.util.spawn({
                    cmd: cmd,
                    args: ["server.js"]
                }, onServerDeath);
                return;
            }
            if (serverWatcher) {
                serverWatcher.close();
            }
            if (err) {
                return done(err);
            }
            done();
        };
        // Restarts `serverProc` when called
        var restartServer = function() {
            restartOnNextDeath = true;
            serverProc.kill();
        };
        // Calls `restartServer` when a file in "server/" is modified
        serverWatcher = fs.watch("server/", {}, restartServer);
        // Start the server
        serverProc = grunt.util.spawn({
            cmd: cmd,
            args: ["server.js"]
        }, onServerDeath);
    });

    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("test", ["check", "mochaTest:test", "mocha_istanbul:test", "istanbul_report",
        "istanbul_check_coverage"]);
    grunt.registerTask("ci-test", ["check", "mochaTest:ci", "mocha_istanbul:ci", "istanbul_report",
        "istanbul_check_coverage"]);
    grunt.registerTask("default", "test");
};
