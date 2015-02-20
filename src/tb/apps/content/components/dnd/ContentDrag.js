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

define(
    'app.content/components/dnd/ContentDrag',
    [
        'tb.core',
        'content.manager',
        'jquery',
        'jsclass'
    ],
    function (Core,
              ContentManager,
              jQuery
            ) {

        'use strict';

        return new JS.Class({

            bindEvents: function (Manager) {
                Core.Mediator.subscribe('on:newclasscontent:dragstart', this.onNewContentDragStart, Manager);
                Core.Mediator.subscribe('on:classcontent:dragstart', this.onContentDragStart, Manager);
            },

            unbindEvents: function () {
                Core.Mediator.unsubscribe('on:newclasscontent:dragstart', this.onNewContentDragStart);
                Core.Mediator.unsubscribe('on:classcontent:dragstart', this.onContentDragStart);
            },

            /**
             * Event trigged on start drag content
             * @param {Object} event
             */
            onNewContentDragStart: function (event) {
                var target = jQuery(event.target);

                this.dataTransfer.content = {type: target.data(this.typeDataAttribute)};
            },

            /**
             * Event trigged on start drag content
             * @param {Object} event
             */
            onContentDragStart: function (event) {
                var target = jQuery(event.target).parents('.' + this.contentClass + ':first'),
                    content = ContentManager.getContentByNode(target),
                    img = document.createElement('img');

                // this.dataTransfer.target = target.clone();
                // target.replaceWith('<div id="old-position"></div>');
                this.dataTransfer.is_drop = false;

                this.dataTransfer.content = content;

                img.src = content.definition.image;
                img.style = {
                    width: '25px',
                    height: '25px'
                };

                event.dataTransfer.setDragImage(img, 25, 25);
            }
        });
    }
);