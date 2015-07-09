define(
    'tb.component/siteselector/main',
    [
        'Core/Renderer',
        'Core/DriverHandler',
        'Core/RestDriver',
        'text!tb.component/siteselector/selector.twig',
        'jquery'
    ],
    function (Renderer, CoreDriverHandler, CoreRestDriver, tpl, jQuery) {
        'use strict';

        var sites = [],
            dfd = jQuery.Deferred(),
            exposeApi = function (sitesAvailable) {
                var api = {
                    identifier: 'site-selector',
                    sites: sitesAvailable,
                    render: function (identifier) {
                        this.identifier = identifier || this.identifier;
                        return Renderer.render(tpl, {id: this.identifier, sites: this.sites});
                    },
                    getSelected: function () {
                        var selected = this.getJqueryElement();
                        return selected.val();
                    },
                    getJqueryElement: function () {
                        return jQuery('#' + this.identifier + ' option[selected="selected"]');
                    }
                };
                api.sites = sites;
                return api;
            };

        if (sites.length === 0) {
            CoreDriverHandler.addDriver('rest', CoreRestDriver);
            CoreDriverHandler.read('site').then(
                function(sitesAvailable) {
                    console.log(sitesAvailable);
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