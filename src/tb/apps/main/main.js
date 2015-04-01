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
require.config({
    paths: {
        'main.routes': 'src/tb/apps/main/routes',
        'main.main.controller': 'src/tb/apps/main/controllers/main.controller',

        //Templates
        'main/tpl/toolbar': 'src/tb/apps/main/templates/toolbar.twig',
        'main/tpl/tab-wrapper': 'src/tb/apps/main/components/templates/tab-wrapper.twig',

        //Views
        'main.view.index': 'src/tb/apps/main/views/main.view.index',

        //Components
        'main.toolbar.manager': 'src/tb/apps/main/components/ToolbarManager'
    }
});

define('app.main', ['tb.core', 'tb.core.ApplicationManager', 'main.view.index', 'jquery', 'component!popin', 'bootstrapjs'], function (Core, ApplicationManager, MainViewIndex, jQuery, Popin) {
    'use strict';

    /**
     * Main application defining default templates and themes
     */
    Core.ApplicationManager.registerApplication('main', {

        /**
         * occurs on initialization of main application
         */
        onInit: function () {
            this.config = {
                tbSelector: Core.get('wrapper_toolbar_selector')
            };

            var toolbar = jQuery(this.config.tbSelector),
                pageUid = toolbar.attr('data-page-uid'),
                siteUid = toolbar.attr('data-site-uid'),
                layoutUid = toolbar.attr('data-layout-uid');

            if (!toolbar.length) {
                Core.exception('MissingSelectorException', 500, 'Selector "' + this.config.tbSelector + '" does not exists, MainApplication cannot be initialized.');
            }

            if (null === pageUid || null === siteUid || null === layoutUid) {
                Core.exception('MissingDataException', 500, 'Page uid, Site uid and Layout uid must be set in toolbar');
            }

            Core.set('page.uid', pageUid);
            Core.set('site.uid', siteUid);
            Core.set('layout.uid', layoutUid);

            Core.set('application.main', this);

            Popin.init(this.config.tbSelector);
        },

        /**
         * occurs on start of main application
         */
        onStart: function () {
            ApplicationManager.invokeService('content.main.findDefinitions', Core.get('page.uid')).done(function (promise) {
                promise.done(promise).done(function (definitions) {
                    ApplicationManager.invokeService('content.main.listenDOM', definitions);
                });
            });

            ApplicationManager.invokeService('content.main.computeImagesInDOM');

            // Listen event save
            Core.Mediator.subscribe('on:save:click', function () {
                ApplicationManager.invokeService('content.main.save');
            });

            // Listen event validate
            Core.Mediator.subscribe('on:validate:click', function () {
                ApplicationManager.invokeService('content.main.validate');
            });

            // Listen event cancel
            Core.Mediator.subscribe('on:cancel:click', function () {
                ApplicationManager.invokeService('content.main.cancel');
            });

            var view = new MainViewIndex(this.config);
            view.render();
        }
    });
});
