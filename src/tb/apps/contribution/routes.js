define(["tb.core"], function (BbCore) {
    'use strict';

    /**
     * Register every routes of contribution application into BbCore.routeManager
     */
    BbCore.RouteManager.registerRoute('contribution', {
        prefix: 'contribution',
        routes: {
            'index': {
                url: '/index',
                action: 'MainController:index'
            },

            'media-library': {
                url: '/medialibrary',
                action: 'MainController:showMediaLibrary'
            }
        }
    });
});
