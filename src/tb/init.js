/*
 * Copyright (c) 2011-2013 Lp digital system
 *
 * This file is part of BackBee.
 *
 * BackBee is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BackBee is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with BackBee. If not, see <http://www.gnu.org/licenses/>.
 */

define(['jquery'], function (jQuery) {

    'use strict';

    var selector = jQuery('[data-toolbar-selector="true"]'),
        toolbarSelector = '#' + selector.attr('id'),
        init = {

            toolBarDisplayed: false,

            configUri: 'toolbar/config',

            listen: function () {
                var autoStart = selector.attr('data-autostart');

                if (autoStart === undefined || autoStart === false) {
                    jQuery(document).bind('keyup', jQuery.proxy(this.manageAccess, this));
                } else {
                    this.load();
                }
            },

            manageAccess: function (event) {
                if (!this.toolBarDisplayed) {
                    if (!event.altKey || !event.ctrlKey || 66 !== event.keyCode) {
                        return;
                    }
                    this.load();
                }
            },

            load: function () {
                var self = this;

                require(['tb.core', 'component!session'], function (Core, session) {

                    Core.set('session', session);
                    Core.set('is_connected', session.isAuthenticated());
                    Core.set('wrapper_toolbar_selector', toolbarSelector);
                    Core.set('api_base_url', selector.attr('data-api'));

                    require(
                        [
                            'tb.core.DriverHandler',
                            'tb.core.RestDriver',
                            'tb.core.Renderer',
                            'component!translator'
                        ],
                        function (DriverHandler, RestDriver, Renderer, Translator) {

                            RestDriver.setBaseUrl(Core.get('api_base_url'));
                            DriverHandler.addDriver('rest', RestDriver);

                            var initOnConnect = function () {
                                    DriverHandler.read(self.configUri).done(function (config) {
                                        Core.initConfig(config);

                                        Translator.init(Core.config('component:translator'));

                                        Renderer.addFunction('trans', jQuery.proxy(Translator.translate, Translator));
                                        Renderer.addFilter('trans', jQuery.proxy(Translator.translate, Translator));

                                        require(['component!exceptions-viewer'], {});
                                    });

                                },
                                router = null;

                            Core.ApplicationManager.on('routesLoaded', function () {
                                /*cf http://backbonejs.org/#Router for available options */
                                router = Core.RouteManager.initRouter({silent: true});
                            });

                            Core.ApplicationManager.on('appIsReady', function (app) {
                                router.navigate(app.getMainRoute());
                            });

                            if (session.isAuthenticated()) {
                                initOnConnect();
                            } else {
                                Core.Mediator.subscribe('on:success:login', function () {
                                    self.toolBarDisplayed = true;
                                    initOnConnect();
                                });
                            }
                        },
                        self.onError
                    );
                }, this.onError);
            },

            onError: function (error) {
                console.log(error);
            }
        };
    return init;
});
