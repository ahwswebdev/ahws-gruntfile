/*globals module, grunt, require, process*/


//
// Grunt configuration
//
var glob = require('glob'),
    timeGrunt = require('time-grunt'),
    fs = require('fs'),
    asci = require('./asci.js');

module.exports = function (grunt) {

    'use strict';

    var cwd = process.cwd(),
        loadConfig = (function(path) {
            var object = {},
                key;

            glob.sync('*', {cwd: path}).forEach(function (option) {
                key = option.replace(/\.js$/, '');
                object[key] = require(path + option);
            });

            return object;
        }),
        ahwsJsonFile,
        config;

    asci();

    //Create symlinks to parent directory to facilitate node_modules sharing among ecommerce-ah-online modules
    fs.symlink('../node_modules', 'node_modules', function() {});
    fs.symlink('../package.json', 'package.json', function() {});

    //Load AHWS json file
    if (grunt.file.exists(cwd + '/ahws.json')) {
        ahwsJsonFile = grunt.file.readJSON(cwd + '/ahws.json');
    } else {
        ahwsJsonFile = {};
        grunt.log.write('ahws.json file does not exist, see readme.md');
    }

    // Load grunt tasks
    grunt.file.expand('../node_modules/grunt-*').forEach(grunt.loadNpmTasks);
    grunt.file.expand('../node_modules/ahws-grunt-*').forEach(grunt.loadNpmTasks);

    //Start time grunt
    timeGrunt(grunt);

    //Write .compiled
    grunt.file.write(cwd + '/.compiled', '');

    // Register grunt tasks
    grunt.loadTasks(cwd + '/grunt_tasks');

    // Initialize grunt tasks
    config = {
        pkg: grunt.file.readJSON(cwd + '/config.json'),
        bwr: grunt.file.readJSON(cwd + '/bower.json'),
        ahws: ahwsJsonFile,
        env: process.env
    };

    //Create combined config
    grunt.util._.extend(config, loadConfig(cwd + '/grunt_tasks/options/'));

    //Init grunt
    grunt.initConfig(config);
};
