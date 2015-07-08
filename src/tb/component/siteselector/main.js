define(
    'tb.component/siteselector/main',
    [
        'CoreRenderer',
        'Core/DriverHandler',
        'Core/RestDriver',
        'text!tb.component/siteselector/selector.twig'
        'jQuery'
    ],
    function (Renderer, CoreDriverHandler, CoreRestDriver, tpl, jQuery) {
        'use strict';

        var sites = [],
            dfd = jQuery.deferred(),
            exposeApi = function () {
                var api = {
                    identifier: 'site-selector',
                    sites: [],
                    render: function (identifier) {
                        this.identifier = identifier || this.identifier;
                        return Renderer.render(tpl, {id: this.identifier, sites: this.sites});
                    },
                    getSelected: function () {
                        var selected = jQuery('#' . this.identifier . ' option[selected="selected"]');
                        return selected.val();
                    }
                };
                api.sites = sites;
                return api;
            };

        if (sites.length === 0) {
            CoreDriverHandler.addDriver('rest', CoreRestDriver);
            CoreDriverHandler.read('site').then(
                function(sitesAvailable) {
                    sites = sitesAvailable;
                    dfd.resolve(exposeApi(sitesAvailable));
                },
                function (reason) {
                    dfd.reject(reason);
                }
            );
        } else {
            dfd.resolve(exposeApi(sites));
        }

        return dfd.promise();
    }
);