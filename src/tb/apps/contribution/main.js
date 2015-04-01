require.config({
    paths: {
        'contribution.routes': 'src/tb/apps/contribution/routes',
        'contribution.main.controller': 'src/tb/apps/contribution/controllers/main.controller',

        /*managers*/
        'content.pluginmanager': 'src/tb/apps/content/components/PluginManager',

        //Views
        'contribution.view.index': 'src/tb/apps/contribution/views/contribution.view.index',

        //Templates
        'contribution/tpl/index': 'src/tb/apps/contribution/templates/index.twig'
    }
});

define('app.contribution', ['tb.core', 'content.pluginmanager', 'jquery'], function (Core, PluginManager, jQuery) {
    'use strict';

    /**
     * Contribution application declaration
     */
    Core.ApplicationManager.registerApplication('contribution', {
        /**
         * occurs on initialization of contribution application
         */
        onInit: function () {
            PluginManager.getInstance().init();

            Core.Scope.subscribe('block', jQuery.proxy(this.enablePluginManager, this, "contribution.block"), jQuery.proxy(this.disablePluginManager, this));
            Core.Scope.subscribe('content', jQuery.proxy(this.enablePluginManager, this, "contribution.content"), jQuery.proxy(this.disablePluginManager, this));
            Core.Scope.subscribe('page', jQuery.proxy(this.enablePluginManager, this, "contribution.page"), jQuery.proxy(this.disablePluginManager, this));
        },

        /**
         * occurs on start of contribution application
         */
        onStart: function () {
            return false;
        },

        enablePluginManager: function (scope) {
            PluginManager.getInstance().registerScope(scope);
            PluginManager.getInstance().enablePlugins();
        },

        disablePluginManager: function () {
            PluginManager.getInstance().disablePlugins();
        },
        /**
         * occurs on stop of contribution application
         */
        onStop: function () {
            PluginManager.getInstance().disablePlugins();
        },

        /**
         * occurs on error of contribution application
         */
        onError: function () {
            console.log('error in contribution application');
        }
    });

});
