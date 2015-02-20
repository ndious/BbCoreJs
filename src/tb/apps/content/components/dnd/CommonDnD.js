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

define('app.content/components/dnd/CommonDnD', ['tb.core', 'jquery', 'content.manager', 'jsclass'], function (Core, jQuery, ContentManager) {
    'use strict';

    return new JS.Class({

        bindEvents: function (Manager) {
            Core.Mediator.subscribe('on:newclasscontent:dragstart', this.initDragAction, Manager);
            Core.Mediator.subscribe('on:classcontent:dragstart', this.initDragAction, Manager);

            Core.Mediator.subscribe('on:newclasscontent:dragover', this.onDragOver, Manager);
            Core.Mediator.subscribe('on:classcontent:dragover', this.onDragOver, Manager);

            // Core.Mediator.subscribe('on:newclasscontent:dragenter', this.onDragEnter, Manager);
            // Core.Mediator.subscribe('on:classcontent:dragenter', this.onDragEnter, Manager);

            // Core.Mediator.subscribe('on:newclasscontent:dragleave', this.onDragLeave, Manager);
            // Core.Mediator.subscribe('on:classcontent:dragleave', this.onDragLeave, Manager);

            Core.Mediator.subscribe('on:newclasscontent:drop', this.onDrop, Manager);
            Core.Mediator.subscribe('on:classcontent:drop', this.onDrop, Manager);

            Core.Mediator.subscribe('on:newclasscontent:dragend', this.endDragAction, Manager);
            Core.Mediator.subscribe('on:classcontent:dragend', this.endDragAction, Manager);
        },

        unbindEvents: function () {
            Core.Mediator.unsubscribe('on:newclasscontent:dragstart', this.initDragAction);
            Core.Mediator.unsubscribe('on:classcontent:dragstart', this.initDragAction);

            Core.Mediator.unsubscribe('on:newclasscontent:dragover', this.onDragOver);
            Core.Mediator.unsubscribe('on:classcontent:dragover', this.onDragOver);

            // Core.Mediator.unsubscribe('on:newclasscontent:dragenter', this.onDragEnter);
            // Core.Mediator.unsubscribe('on:classcontent:dragenter', this.onDragEnter);

            // Core.Mediator.unsubscribe('on:newclasscontent:dragleave', this.onDragLeave);
            // Core.Mediator.unsubscribe('on:classcontent:dragleave', this.onDragLeave);

            Core.Mediator.unsubscribe('on:newclasscontent:drop', this.onDrop);
            Core.Mediator.unsubscribe('on:classcontent:drop', this.onDrop);

            Core.Mediator.unsubscribe('on:newclasscontent:dragend', this.endDragAction);
            Core.Mediator.unsubscribe('on:classcontent:dragend', this.endDragAction);
        },

        /**
         * Event trigged on start drag content
         * @param {Object} event
         */
        initDragAction: function (event) {
            console.log(event);
            event.stopPropagation();
            console.log('drag start');

            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text', 'draging-content');
        },

        /**
         * Event trigged on drag over dropzone
         * @param {Object} event
         */
        onDragOver: function (event) {
            if (event.target.getAttribute('dropzone')) {
                event.preventDefault();
            }
        },

        /**
         * Event trigged on drop content
         * @param {Object} event
         * @returns {Boolean}
         */
        onDrop: function (event) {
            event.stopPropagation();

            var target = jQuery(event.target),
                config = {},
                parent = target.parents(this.dropZoneAttribute + ':first'),
                parentObjectIdentifier = ContentManager.retrievalObjectIdentifier(parent.data(this.identifierDataAttribute));

            config.event = event;
            this.dataTransfer.is_drop = true;

            this.dataTransfer.content.position = this.getPosition(target, parent);
            this.dataTransfer.parent = ContentManager.buildElement(parentObjectIdentifier);

        },

        /**
         * Event trigged on drag end content
         * @param {Object} event
         * @returns {Boolean}
         */
        endDragAction: function (event) {
            console.log(event);
            console.log('drag end');
            // var old_pos = jQuery('#old-position');
            event.stopPropagation();
            // if (!this.dataTransfer.is_drop) {
            //     old_pos.replaceWith(this.dataTransfer.target);
            // } else {
            //     old_pos.remove();
            // }

            this.resetDataTransfert();
            this.cleanHTMLZoneForContentset();

            return false;
        }
    });
});