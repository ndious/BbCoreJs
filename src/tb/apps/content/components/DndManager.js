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
    [
        'tb.core.Renderer',
        'jquery',
        'text!content/tpl/dropzone',
        'component!dnd',
        'content.manager',
        'app.content/components/dnd/CommonDnD',
        'app.content/components/dnd/ContentDrag',
        'app.content/components/dnd/ContentDrop',
        'jsclass'
    ],
    function (Renderer,
              jQuery,
              dropZoneTemplate,
              dnd,
              ContentManager,
              CommonDnD,
              ContentDrag,
              ContentDrop
            ) {

        'use strict';

        var DndManager = new JS.Class({

            contentClass: 'bb-content',

            identifierDataAttribute: 'bb-identifier',

            idDataAttribute: 'bb-id',

            typeDataAttribute: 'bb-type',

            droppableClass: '.bb-droppable',

            dropZoneClass: 'bb-dropzone',

            dndClass: 'bb-dnd',

            initialize: function () {
                this.resetDataTransfert();
                this.common = new CommonDnD();
                this.drag = new ContentDrag();
                this.drop = new ContentDrop();
            },

            initDnD: function () {
                dnd('#block-contrib-tab').addListeners('classcontent', '.' + this.dndClass);
                dnd('#bb5-site-wrapper').addListeners('classcontent', '.' + this.dndClass);
                jQuery('body').on('dragenter', jQuery.proxy(this.mediaDragEnter, this));
            },

            resetDataTransfert: function () {
                this.dataTransfer = {
                    content: {},
                    identifier: null,
                    contentSetDroppable: null,
                    parent: null,
                    isMedia: false
                };
            },

            bindEvents: function () {
                this.common.bindEvents(this);
                this.drag.bindEvents(this);
                this.drop.bindEvents(this);
            },

            unbindEvents: function () {
                this.common.unbindEvents();
                this.drag.unbindEvents();
                this.drop.unbindEvents();
            },

            mediaDragEnter: function () {
                var img = jQuery('[data-bb-identifier^="Element/Image"]');

                img.addClass('bb-dnd');
                img.attr('dropzone', true);
                img.css('opacity', '0.6');

                if (!img.parent().hasClass('img-wrap-dnd')) {
                    img.wrap('<div class="img-wrap-dnd">');
                }
            },

            /**
             * Show the dropzone after and before each children
             * @param {Object} contentSets
             */
            showHTMLZoneForContentSet: function (contentSets, currentContentId) {
                var key,
                    contentSet,
                    children,
                    firstChild,
                    div = Renderer.render(dropZoneTemplate, {'class': this.dropZoneClass});

                for (key in contentSets) {
                    if (contentSets.hasOwnProperty(key)) {

                        contentSet = contentSets[key];
                        contentSet.isChildrenOf(currentContentId);

                        if (contentSet.id !== currentContentId && !contentSet.isChildrenOf(currentContentId)) {

                            children = contentSet.getNodeChildren();
                            firstChild = children.first();

                            if (firstChild.length > 0) {
                                if (undefined !== currentContentId) {
                                    if (firstChild.data(this.idDataAttribute) !== currentContentId) {
                                        firstChild.before(div);
                                    }
                                } else {
                                    firstChild.before(div);
                                }
                            } else {
                                contentSet.jQueryObject.prepend(div);
                            }

                            this.putDropZoneAroundContentSetChildren(children, div, currentContentId);
                        }
                    }
                }
            },

            /**
             * Put HTML dropzone around the contentset's children
             * @param {Object} children
             * @param {String} template
             * @param {String} currentContentId
             */
            putDropZoneAroundContentSetChildren: function (children, template, currentContentId) {
                var self = this;

                children.each(function () {
                    var currentTarget = jQuery(this),
                        next = currentTarget.next('.' + self.contentClass);

                    if (undefined !== currentContentId) {
                        if (currentTarget.data(self.idDataAttribute) !== currentContentId &&
                                next.data(self.idDataAttribute) !== currentContentId) {

                            currentTarget.after(template);
                        }
                    } else {
                        currentTarget.after(template);
                    }
                });
            },

            /**
             * Delete all dropzone
             */
            cleanHTMLZoneForContentset: function () {
                jQuery('.' + this.dropZoneClass).remove();
            },

            /**
             * Return position of element will be dropped
             * @param {Object} zone
             * @returns {Number}
             */
            getPosition: function (zone, parent) {
                var prev = zone.prev('.' + this.contentClass),
                    contentSet = ContentManager.getContentByNode(parent),
                    pos = 0;

                if (prev.length > 0) {
                    contentSet.getNodeChildren().each(function (key) {
                        if (this === prev.get(0)) {
                            pos = key + 1;
                            return;
                        }
                    });
                }

                return pos;
            }
        });

        return new JS.Singleton(DndManager);
    }
);