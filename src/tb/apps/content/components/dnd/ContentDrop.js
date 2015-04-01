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
    'app.content/components/dnd/ContentDrop',
    [
        'tb.core',
        'jquery',
        'component!notify',
        'content.container',
        'content.manager',
        'resource.repository',
        'tb.core.ApplicationManager',
        'component!mask',
        'jsclass'
    ],
    function (Core,
              jQuery,
              Notify,
              ContentContainer,
              ContentManager,
              ResourceRepository,
              ApplicationManager,
              Mask
            ) {

        'use strict';

        return new JS.Class({

            bindEvents: function (Manager) {

                this.manager = Manager;

                Core.Mediator.subscribe('on:classcontent:drop', this.onDrop, this);
            },

            unbindEvents: function () {
                Core.Mediator.unsubscribe('on:classcontent:drop', this.onDrop);
            },

            doDropMedia: function (event) {
                var target = jQuery(event.target),
                    file = event.dataTransfer.files[0],
                    reader = new window.FileReader(),
                    content = ContentManager.getContentByNode(target),
                    mask = Mask.createMask(),
                    parent = content.jQueryObject.parent();

                reader.onload = function (e) {

                    var data = {
                            'src': window.btoa(e.target.result),
                            'originalname': file.name
                        },
                        elements = {};

                    mask.mask(parent);

                    ResourceRepository.upload(data).done(function (response) {

                        elements.path = response.path;
                        elements.originalname = response.originalname;
                        content.setElements(elements);

                        ApplicationManager.invokeService('content.main.save').done(function (promise) {
                            promise.done(function () {
                                content.refresh();
                                mask.unmask(parent);
                                content.jQueryObject.unwrap();
                            });
                        });
                    });
                };

                reader.readAsBinaryString(file);
            },

            onDrop: function (event) {
                event.preventDefault();

                if (event.dataTransfer.files.length > 0) {

                    this.doDropMedia(event);

                    return;
                }

                var target = jQuery(event.target),
                    config = {},
                    parent = target.parents(this.manager.droppableClass + ':first'),
                    parentObjectIdentifier = ContentManager.retrievalObjectIdentifier(parent.data(this.manager.identifierDataAttribute));

                config.event = event;

                config.position = this.manager.getPosition(target, parent);
                config.parent = ContentManager.buildElement(parentObjectIdentifier);
                config.type = this.manager.dataTransfer.content.type;

                if (this.manager.dataTransfer.isNew === true) {
                    this.addContent(config);
                } else {
                    this.updateContent(config);
                }
            },

            /**
             * Used into a drop event.
             * Verify if current contentset accept the content, create the content
             * from api and show him on the html
             * @param {Object} config
             */
            addContent: function (config) {

                if (ContentContainer.isInArray(this.manager.dataTransfer.contentSetDroppable, 'type', config.parent.type)) {

                    ContentManager.createElement(config.type).then(
                        function (content) {
                            config.parent.append(content, config.position);
                        },
                        function () {
                            Notify.error('An error occured when drop a new content');
                        }
                    );
                }
            },

            /**
             * Used into a drop event.
             * Move the content to a new contentset
             * and set updated old contentset
             * @param {Object} config
             */
            updateContent: function (config) {

                var content = ContentContainer.find(this.manager.dataTransfer.content.id),
                    oldParent = content.jQueryObject.parents('.' + this.manager.contentClass + ':first'),
                    oldParentAsContent;

                oldParentAsContent = ContentManager.getContentByNode(oldParent);

                content.jQueryObject.remove();
                content.jQueryObject.length = 0;

                config.parent.append(content, config.position);

                oldParentAsContent.setUpdated(true);
            }
        });
    }
);