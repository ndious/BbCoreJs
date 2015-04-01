require.config({
    baseUrl: './',
    urlArgs: 'cb=' + Math.random(),
    paths: {
        'tb.core': 'src/tb/main',
        'component': 'src/tb/component/component',

        'jquery': 'bower_components/jquery/dist/jquery.min',
        'jqueryui': 'bower_components/jquery-ui/jquery-ui.min',
        'jsclass' : 'node_modules/jsclass/min/core',
        'underscore': 'bower_components/underscore/underscore-min',
        'nunjucks': 'bower_components/nunjucks/browser/nunjucks.min',
        'BackBone': 'bower_components/backbone/backbone',
        'text': 'bower_components/requirejs-text/text',
        'moment': 'bower_components/moment/moment',
        'URIjs': 'bower_components/uri.js/src',
        'datetimepicker': 'bower_components/datetimepicker/jquery.datetimepicker',
        'jquery-layout' : 'bower_components/jquery.layout/dist/jquery.layout-latest.min',
        'lib.jqtree': 'bower_components/jqtree/tree.jquery',
        'jssimplepagination': 'bower_components/jssimplepagination/jquery.simplePagination',
        'ckeeditor' : 'lib/ckeeditor/ckeditor',

        'jasmine': 'node_modules/grunt-contrib-jasmine/vendor/jasmine-2.0.0/jasmine',
        'jasmine-html': 'node_modules/grunt-contrib-jasmine/vendor/jasmine-2.0.0/jasmine-html',
        'es5-shim': 'bower_components/es5-shim',

        'spec': 'specs/'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        BackBone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        jasmine: {
            exports: 'jasmine'
        },
        'jasmine-html': {
            deps: ['jasmine'],
            exports: 'jasmine'
        }
    }
});
