/* Application Déclaration */
require.config({
    paths: {
        'test.routes': 'specs/tb/apps/test/routes',
        'test.test.controller': 'specs/tb/apps/test/controllers/test.controller'
    }
});

define('app.test', ['tb.core', 'test.test.controller'], function (bbCore) {
    'use strict';

    bbCore.ApplicationManager.registerApplication('test', {
        name: 'test',

        onInit: function () {
            return;
        },

        onStart: function () {
            return;
        },

        onStop: function () {
            return;
        },

        onError: function () {
            return;
        }

    });
});
