define(['tb.core'], function (bbCore) {
    'use strict';

    bbCore.ControllerManager.registerController('TestController', {
        appName: 'test',

        config: {
            imports: []
        },

        onInit: function () {
            this.value = null;
        },

        fooAction: function () {
            this.value = 'foo';
        },

        barAction: function () {
            this.value = 'bar';
        }
    });

});
