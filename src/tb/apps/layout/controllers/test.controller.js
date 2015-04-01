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
define(['tb.core'], function (bbCore) {
    'use strict';

    bbCore.ControllerManager.registerController('TestController', {
        appName: 'layout',

        config: {
            imports: ['test.manager', 'rte.manager']
        },

        /**
         * onInit is called after dependencies loading
         */
        onInit: function (require) {
            console.log(require);
        },

        homeAction: function () {
            console.log('... homeAction ...');
            return this.render('#placeHolder', '/path/template', {});
        },

        listAction: function () {
            console.log('... listAction ...');
        },

        displayLayoutAction: function () {
            var layouts = {}, /* new Layout() */
                self = this;

            this.loadTemplate('/path/template').done(function (tpl) {
                self.render(tpl, {
                    layout: layouts
                });
            });
        }
    });

});
