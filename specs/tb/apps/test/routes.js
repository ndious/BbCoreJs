define(['tb.core'], function (bbCore) {
    'use strict';

    /**
     * Register every routes of content application into bbCore.routeManager
     */
    bbCore.RouteManager.registerRoute('test', {
        prefix: '',
        routes: {
            'foo': {
                url: 'test/foo',
                action: 'TestController:foo'
            }
        }
    });
});
