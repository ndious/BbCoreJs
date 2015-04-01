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

define(['tb.core', 'tb.core.Renderer', 'BackBone', 'component!popin', 'jquery'], function (Core, Renderer, Backbone, PopinManager, jQuery) {
    'use strict';

    var ContentView = Backbone.View.extend({

        mainSelector: Core.get('wrapper_toolbar_selector'),

        initialize: function (template, formTag, element) {
            this.el = formTag;
            this.template = template;
            this.element = element;

            this.updateBtnId = '#' + element.getKey() + '_update_btn';

            this.buildPopin();

            this.bindEvents();
        },

        buildPopin: function () {
            var currentPopin = this.element.popinInstance;

            this.popin = (currentPopin !== undefined) ? PopinManager.createSubPopIn(currentPopin) : PopinManager.createPopIn();
        },

        bindEvents: function () {
            jQuery(this.mainSelector).on('click', this.updateBtnId, jQuery.proxy(this.onUpdateClick, this));
        },

        onUpdateClick: function () {
            this.popin.display();
        },

        /**
         * Render the template into the DOM with the Renderer
         * @returns {String} html
         */
        render: function () {
            return Renderer.render(this.template, {element: this.element});
        }
    });

    return ContentView;
});