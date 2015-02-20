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
        'component!notify',
        'content.container',
        'content.manager',
        'jsclass'
    ],
    function (Core,
              Notify,
              ContentContainer,
              ContentManager
            ) {

        'use strict';

        return new JS.Class({

            bindEvents: function (Manager) {
                Core.Mediator.subscribe('on:newclasscontent:dragstart', this.onDragStart, Manager);
                Core.Mediator.subscribe('on:classcontent:dragstart', this.onDragStart, Manager);

                Core.Mediator.subscribe('on:newclasscontent:drop', this.addContent, Manager);
                Core.Mediator.subscribe('on:classcontent:drop', this.updateContent, Manager);
            },

            unbindEvents: function () {
                Core.Mediator.unsubscribe('on:newclasscontent:dragstart', this.onDragStart);
                Core.Mediator.unsubscribe('on:classcontent:dragstart', this.onDragStart);

                Core.Mediator.unsubscribe('on:newclasscontent:drop', this.addContent);
                Core.Mediator.unsubscribe('on:classcontent:drop', this.updateContent);
            },

            /**
             * Event trigged on start drag content
             * @param {Object} event
             */
            onDragStart: function () {
                ContentManager.buildContentSet();

                this.dataTransfer.contentSetDroppable = ContentContainer.findContentSetByAccept(this.dataTransfer.content.type);
                this.showHTMLZoneForContentSet(
                    this.dataTransfer.contentSetDroppable,
                    this.dataTransfer.content.id
                );
            },

            /**
             * Used into a drop event.
             * Verify if current contentset accept the content, create the content
             * from api and show him on the html
             * @param {Object} config
             */
            addContent: function () {
                if (ContentContainer.isInArray(this.dataTransfer.contentSetDroppable, 'type', this.dataTransfer.parent.type)) {

                    ContentManager.createElement(this.dataTransfer.content.type).then(
                        function (content) {
                            this.dataTransfer.parent.append(content, this.dataTransfer.content.position);
                        },
                        function () {
                            Notify.error('Error: update fail');
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
            updateContent: function () {
                var content = ContentContainer.find(this.dataTransfer.content.id),
                    oldParent = content.jQueryObject.parents('.' + this.contentClass + ':first'),
                    oldParentAsContent;

                if (oldParent.data(this.idDataAttribute)) {
                    oldParentAsContent = ContentContainer.find(oldParent.data(this.idDataAttribute));
                } else {
                    oldParentAsContent = ContentManager.buildElement(oldParent);
                }

                oldParentAsContent.setUpdated(true);

                this.dataTransfer.parent.append(content, this.dataTransfer.content.position);
            }
        });
    }
);