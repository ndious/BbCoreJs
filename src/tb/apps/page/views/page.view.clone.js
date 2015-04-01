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
        'tb.core.Api',
        'jquery',
        'page.repository',
        'page.form',
        'component!popin',
        'component!formbuilder'
    ],
    function (require, Api, jQuery, PageRepository, PageForm) {

        'use strict';

        /**
         * View of new page
         * @type {Object} Backbone.View
         */
        var PageViewClone = Backbone.View.extend({

            /**
             * Initialize of PageViewClone
             */
            initialize: function (config) {
                if (typeof config.page_uid !== 'string') {
                    Api.exception('MissingPropertyException', 500, 'Property "page_uid" must be set to constructor');
                }

                this.config = config;
                this.page_uid = this.config.page_uid;
                this.callbackAfterSubmit = config.callbackAfterSubmit;

                this.popin = require('component!popin').createPopIn();
                this.formBuilder = require('component!formbuilder');
            },

            onSubmit: function (data) {
                var self = this;

                if (this.config.hasOwnProperty('parent_uid')) {
                    data.parent_uid = this.config.parent_uid;
                }

                if (this.config.hasOwnProperty('sibling_uid')) {
                    data.sibling_uid = this.config.sibling_uid;
                }

                this.popin.mask();
                PageRepository.clone(this.page_uid, data).done(function (res, response) {
                    if (typeof self.callbackAfterSubmit === 'function') {
                        self.callbackAfterSubmit(data, response, res);
                    }

                    self.popin.unmask();
                    self.popin.hide();
                });
            },

            onValidate: function (form, data) {
                if (!data.hasOwnProperty('title') || data.title.trim().length === 0) {
                    form.addError('title', 'Title is required');
                }
            },

            /**
             * Render the template into the DOM with the ViewManager
             * @returns {Object} PageViewClone
             */
            render: function () {

                var self = this;

                this.popin.setTitle('Clone page');
                this.popin.display();
                this.popin.mask();

                PageForm.clone(this.page_uid).done(function (configForm) {

                    configForm.onSubmit = jQuery.proxy(self.onSubmit, self);
                    configForm.onValidate = self.onValidate;

                    self.formBuilder.renderForm(configForm).done(function (html) {
                        self.popin.setContent(html);
                        self.popin.unmask();
                    });
                });

                return this;
            }
        });

        return PageViewClone;
    }
);