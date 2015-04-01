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
        'require',
        'jquery',
        'page.repository',
        'component!popin'
    ],
    function (require, jQuery, PageRepository) {

        'use strict';

        /**
         * View of delete page
         * @type {Object} Backbone.View
         */
        var PageViewDelete = Backbone.View.extend({

            /**
             * Initialize of PageViewDelete
             */
            initialize: function (config) {
                this.config = config;

                this.popin = require('component!popin').createPopIn();

                this.uid = config.uid;

                this.callbackAfterSubmit = config.callbackAfterSubmit;
            },

            /**
             * Occurs when user confirm deletion
             * Delete page and redirect to home
             */
            onDelete: function () {
                var self = this;

                this.popin.mask();

                PageRepository.delete(this.uid).done(function (data, response) {

                    if (typeof self.callbackAfterSubmit === 'function') {
                        self.callbackAfterSubmit(data, response);
                    }

                    self.popin.unmask();
                    self.popin.hide();

                    if (self.config.doRedirect === true) {
                        jQuery(location).attr('href', '/');
                    }
                });
            },

            /**
             * Occurs when user cancel deletion
             * Close the popin
             */
            onCancel: function () {
                this.popin.hide();
            },

            /**
             * Render the template into the DOM with the ViewManager
             * @returns {Object} PageViewDelete
             */
            render: function () {
                this.popin.setTitle('page deletion');
                this.popin.setContent('Delete page ?');
                this.popin.addButton('Delete', jQuery.proxy(this.onDelete, this));
                this.popin.addButton('Cancel', jQuery.proxy(this.onCancel, this));

                this.popin.display(this.popin);

                return this;
            }
        });

        return PageViewDelete;
    }
);
