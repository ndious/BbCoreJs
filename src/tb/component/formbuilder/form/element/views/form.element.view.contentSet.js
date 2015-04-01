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
        'tb.core',
        'require',
        'tb.core.Renderer',
        'BackBone',
        'jquery',
        'text!tb.component/formbuilder/form/element/templates/contentSet_item.twig',
        'tb.core.ApplicationManager',
        'component!contentselector'
    ],
    function (Core, require, Renderer, Backbone, jQuery, itemTemplate) {

        'use strict';

        var ContentSetView = Backbone.View.extend({

            blockClass: '.bb-block',
            mainSelector: Core.get('wrapper_toolbar_selector'),

            initialize: function (template, formTag, element) {

                this.el = formTag;
                this.template = template;
                this.element = element;

                this.trashId = '#' + this.element.getKey() + '_trash';
                this.trashAllId = '#' + this.element.getKey() + '_trashall';
                this.addContentId = '#' + this.element.getKey() + '_addcontent';
                this.searchContentId = '#' + this.element.getKey() + '_searchcontent';
                this.listId = '#' + this.element.getKey() + '_list';
                this.moveClass = '.' + this.element.getKey() + '_move';
                this.moveDownClass = '.move-down';
                this.moveUpClass = '.move-up';

                this.bindEvents();
            },

            bindEvents: function () {
                var mainNode = jQuery(this.mainSelector);

                mainNode.on('click', 'form#' + this.el + ' ' + this.trashId, jQuery.proxy(this.onDelete, this));
                mainNode.on('click', 'form#' + this.el + ' ' + this.moveClass, jQuery.proxy(this.onMove, this));

                mainNode.on('click', 'form#' + this.el + ' ' + this.trashAllId, jQuery.proxy(this.onDeleteAll, this));
                mainNode.on('click', 'form#' + this.el + ' ' + this.addContentId, jQuery.proxy(this.onAddContent, this));
                mainNode.on('click', 'form#' + this.el + ' ' + this.searchContentId, jQuery.proxy(this.onSearchContent, this));
            },

            onSearchContent: function () {
                var self = this,
                    type = this.element.object_type;

                if (this.contentSelector === undefined) {
                    this.contentSelector = require('component!contentselector').createContentSelector({
                        mode: 'edit',
                        resetOnClose: true
                    });
                    this.contentSelector.on('close', jQuery.proxy(this.handleContentSelection, this));
                }

                require('tb.core.ApplicationManager').invokeService('content.main.getDefinitionManager').done(function (DefinitionManager) {
                    var definition = DefinitionManager.find(type),
                        accepts = definition.accept;

                    self.contentSelector.setContenttypes(accepts);
                    self.contentSelector.display();
                });
            },

            handleContentSelection: function (selections) {
                var self = this,
                    contentInfos,
                    content;

                if (selections.length > 0) {
                    require('tb.core.ApplicationManager').invokeService('content.main.getContentManager').done(function (ContentManager) {
                        var key;

                        for (key in selections) {
                            if (selections.hasOwnProperty(key)) {
                                contentInfos = selections[key];
                                content = ContentManager.buildElement(contentInfos);
                                self.addItem(content);
                            }
                        }
                    });
                }
            },

            onAddContent: function () {
                var self = this,
                    type = this.element.object_type;

                require('tb.core.ApplicationManager').invokeService('content.main.getDefinitionManager').done(function (DefinitionManager) {
                    var definition = DefinitionManager.find(type),
                        accepts = definition.accept;

                    require('tb.core.ApplicationManager').invokeService('content.main.getDialogContentsListWidget').done(function (DialogContentsList) {
                        self.DialogContentsList = DialogContentsList;

                        if (accepts.length === 1) {
                            self.createElement(accepts[0]);
                        } else if (accepts.length === 0) {
                            self.showAddContentPopin();
                        } else {
                            self.showAddContentPopin(self.buildContents(accepts));
                        }
                    });
                });
            },

            /**
             * Bind events of add content popin
             */
            bindAddPopinEvents: function () {
                jQuery('#' + this.widget.popin.getId()).off('click.contentsetadd').on('click.contentsetadd', this.blockClass, jQuery.proxy(this.onContentAddPopinClick, this));
            },

            onContentAddPopinClick: function (event) {

                this.widget.hide();

                var currentTarget = jQuery(event.currentTarget),
                    img = currentTarget.find('img'),
                    type = img.data('bb-type');

                this.createElement(type);

                return false;
            },

            /**
             * Build contents with definition and type
             * @param {Object} accepts
             * @returns {Array}
             */
            buildContents: function (accepts) {
                var contents = [];

                require('tb.core.ApplicationManager').invokeService('content.main.getDefinitionManager').done(function (DefinitionManager) {
                    var key;

                    for (key in accepts) {
                        if (accepts.hasOwnProperty(key)) {
                            contents.push(DefinitionManager.find(accepts[key]));
                        }
                    }
                });

                return contents;
            },

            /**
             * Show popin and bind events
             * @param {Mixed} contents
             */
            showAddContentPopin: function (contents) {
                var config = {};

                if (this.widget === undefined) {
                    if (contents !== undefined) {
                        config.contents = contents;
                    }
                    this.widget = new this.DialogContentsList(config);
                }
                this.widget.show();
                this.bindAddPopinEvents();
            },

            createElement: function (type) {
                var self = this;

                require('tb.core.ApplicationManager').invokeService('content.main.getContentManager').done(function (ContentManager) {
                    ContentManager.createElement(type).done(function (content) {
                        self.addItem(content);
                    });
                });
            },

            addItem: function (content) {
                var list = jQuery(this.listId);

                list.prepend(Renderer.render(itemTemplate, {'element': this.element, 'item': content}));
            },

            onMove: function (event) {
                var target = jQuery(event.currentTarget),
                    li = target.parents('li:first'),
                    prev = li.prev('li'),
                    next = li.next('li');

                if (target.hasClass('move-up')) {
                    if (prev.length > 0) {
                        prev.before(li);
                    }
                } else {
                    if (next.length > 0) {
                        next.after(li);
                    }
                }

                this.updateMoveBtn();
            },

            updateMoveBtn: function () {
                var self = this,
                    list = jQuery(this.listId),
                    children = list.children('li'),
                    count = children.length;

                list.children('li').each(function (index) {

                    var element = jQuery(this),
                        moveDownBtn = element.find(self.moveDownClass),
                        moveUpBtn = element.find(self.moveUpClass);

                    moveDownBtn.addClass('hidden');
                    moveUpBtn.addClass('hidden');

                    if (index === 0) {
                        moveDownBtn.removeClass('hidden');
                    } else if (index === count - 1) {
                        moveUpBtn.removeClass('hidden');
                    } else {
                        moveDownBtn.removeClass('hidden');
                        moveUpBtn.removeClass('hidden');
                    }
                });
            },

            onDeleteAll: function () {
                jQuery(this.listId).children('li').remove();
            },

            onDelete: function (event) {
                var target = jQuery(event.currentTarget),
                    li = target.parents('li:first');

                li.remove();

                this.updateMoveBtn();
            },

            /**
             * Render the template into the DOM with the Renderer
             * @returns {String} html
             */
            render: function () {
                var key,
                    items = [],
                    children = this.element.children,
                    child;

                for (key in children) {
                    if (children.hasOwnProperty(key)) {
                        child = children[key];
                        items.push(Renderer.render(itemTemplate, {'element': this.element, 'item': child}));
                    }
                }

                return Renderer.render(this.template, {element: this.element, 'items': items});
            }
        });

        return ContentSetView;
    }
);