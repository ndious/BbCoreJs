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
        'jquery',
        'tb.core.ApplicationManager',
        'tb.core.Renderer',
        'text!page/tpl/contribution/index',
        'text!page/tpl/contribution/scheduling_publication',
        'page.repository',
        'component!formbuilder',
        'component!popin',
        'moment'
    ],
    function (Core,
              jQuery,
              ApplicationManager,
              Renderer,
              template,
              schedulingTemplate,
              PageRepository,
              FormBuilder,
              PopinManager,
              moment
            ) {

        'use strict';

        /**
         * View of page contribution index
         * @type {Object} Backbone.View
         */
        var PageViewContributionIndex = Backbone.View.extend({

            /**
             * Point of Toolbar in DOM
             */
            el: '#page-contrib-tab',

            mainSelector: Core.get('wrapper_toolbar_selector'),

            schedulingFormTag: '#contribution-scheduling-form',
            schedulingBtnTag: '#contribution-scheduling-btn',
            schedulingTag: '#contribution-scheduling',
            schedulingSubmitTag: '#contribution-scheduling-submit',
            schedulingStateTag: '#contribution-scheduling-state',

            dialogContainerTag: '.bb5-dialog-container',

            /**
             * Initialize of PageViewContributionIndex
             */
            initialize: function (config) {
                this.currentPage = config.data;
            },

            /**
             * Events of view
             */
            bindEvents: function () {
                jQuery(this.el).on('change', '#page-state-select', jQuery.proxy(this.manageState, this));
                jQuery(this.el).on('click', '#page-visibility-input', jQuery.proxy(this.manageVisibilityPage, this));
                jQuery(this.el).on('click', '#contribution-clone-page', jQuery.proxy(this.manageClone, this));
                jQuery(this.el).on('click', '#contribution-edit-page', jQuery.proxy(this.manageEdit, this));
                jQuery(this.el).on('click', '#contribution-delete-page', jQuery.proxy(this.manageDelete, this));
                jQuery(this.el).on('click', this.schedulingBtnTag, jQuery.proxy(this.manageSchedulingPublication, this));
                jQuery(this.el).on('click', '#contribution-seo-page', jQuery.proxy(this.manageSeo, this));
            },

            manageVisibilityPage: function (event) {
                PageRepository.save({uid: this.currentPage.uid, is_visible: event.currentTarget.checked});
            },

            /**
             * Change the state of the page
             * @param {Object} event
             */
            manageState: function (event) {
                var self = jQuery(event.currentTarget),
                    optionSelected = self.children('option:selected');

                PageRepository.save({uid: this.currentPage.uid, state: optionSelected.val()});
            },

            /**
             * Edit the page
             */
            manageEdit: function () {
                ApplicationManager.invokeService('page.main.editPage', {'page_uid': Core.get('page.uid')});
            },

            /**
             * Clone the page
             * @param {Object} event
             */
            manageClone: function () {
                ApplicationManager.invokeService('page.main.clonePage', {'page_uid': this.currentPage.uid});
            },

            /**
             * Delete the page
             * @param {Object} event
             */
            manageDelete: function () {
                ApplicationManager.invokeService('page.main.deletePage', {'uid': this.currentPage.uid, 'doRedirect': true});
            },

            /**
             * On click, build the form and show him in the popin
             * @returns
             */
            manageSchedulingPublication: function () {
                var self = this,
                    config = {
                        elements: {
                            publishing: {
                                label: 'Publication scheduled for',
                                type: 'datetimepicker',
                                placeholder: 'dd/mm/aaaa',
                                template: 'src/tb/apps/page/templates/elements/scheduling-input.twig',
                                value: this.getStateSchedulingAsString(this.currentPage.publishing)
                            },
                            archiving: {
                                label: 'Archiving scheduled for',
                                type: 'datetimepicker',
                                placeholder: 'dd/mm/aaaa',
                                template: 'src/tb/apps/page/templates/elements/scheduling-input.twig',
                                value: this.getStateSchedulingAsString(this.currentPage.archiving)
                            }
                        },
                        form: {
                            submitLabel: 'Ok'
                        },
                        onSubmit: function (data) {
                            var key,
                                date;

                            for (key in data) {
                                if (data.hasOwnProperty(key)) {
                                    date = new Date(data[key]);

                                    if (isNaN(date.getTime())) {
                                        delete data[key];
                                    } else {
                                        data[key] = date.getTime() / 1000;
                                        if (data[key] === parseInt(self.currentPage[key], 10)) {
                                            delete data[key];
                                        }
                                    }
                                }
                            }

                            if (!jQuery.isEmptyObject(data)) {
                                self.setStateScheduling(data);

                                data.uid = self.currentPage.uid;
                                PageRepository.save(data);
                            }

                            jQuery(self.schedulingTag).dialog('close');
                        }
                    };

                if (jQuery(this.schedulingTag).length === 0) {

                    jQuery(this.dialogContainerTag).html(Renderer.render(schedulingTemplate));

                    FormBuilder.renderForm(config).done(function (html) {
                        jQuery(self.schedulingTag).html(html);

                        jQuery(self.schedulingTag).dialog({
                            position: { my: "left top", at: "left+270 bottom+2", of: jQuery("#bb5-maintabsContent") },
                            width: 334,
                            height: 120,
                            autoOpen: false,
                            resizable: false,
                            appendTo: self.mainSelector + " .bb5-dialog-container",
                            dialogClass: "ui-dialog-no-title ui-dialog-pinned-to-banner"
                        });

                        jQuery(self.schedulingTag).dialog('open');
                    });

                } else {
                    if (jQuery(this.schedulingTag).dialog('isOpen')) {
                        jQuery(this.schedulingTag).dialog('close');
                    } else {
                        jQuery(this.schedulingTag).dialog('open');
                    }
                }
            },

            /**
             * Get the correcly format of date in string for datetimepicker
             * @param {number} value
             *
             */
            getStateSchedulingAsString: function (value) {
                var timestamp,
                    day = '';

                if (value !== undefined) {
                    timestamp = moment.unix(value);
                    day = timestamp.format('YYYY/MM/DD HH:mm');
                }

                return day;
            },

            /**
             * Set the sheduling statut in contribution index as string
             * @param {Object} config
             */
            setStateScheduling: function (config) {
                var day,
                    state;

                if (config.hasOwnProperty('publishing') && config.publishing !== '') {
                    day = moment.unix(config.publishing);
                    state = 'from ' + day.format('DD/MM/YYYY HH:mm');
                }

                if (config.hasOwnProperty('archiving') && config.archiving !== '') {
                    day = moment.unix(config.archiving);
                    state += ' till ' + day.format('DD/MM/YYYY HH:mm');
                }

                jQuery(this.schedulingStateTag).html(state);
            },

            /**
             * Get the metadata of page, build form and show in popin
             */
            manageSeo: function () {
                var self = this,
                    popin = PopinManager.createPopIn();

                popin.setTitle('Page SEO');
                popin.display();
                popin.mask();

                PageRepository.getMetadata(this.currentPage.uid).done(function (metadata) {
                    FormBuilder.renderForm(self.buildConfigSeoForm(metadata, popin)).done(function (html) {
                        popin.setContent(html);
                        popin.unmask();
                    });
                });

            },

            /**
             * Compute SEO data for compatibility with REST
             * @param {Object} data
             * @returns {Object}
             */
            computeSeoData: function (data) {
                var key,
                    newKey,
                    delimiter,
                    value,
                    isDefault = true,
                    result = {};

                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        value = data[key];
                        delimiter = key.indexOf('__');
                        isDefault = true;

                        if (-1 !== delimiter) {
                            newKey = key.substring(delimiter + 2);
                            key = key.substring(0, delimiter);
                            isDefault = false;
                        }

                        if (!result.hasOwnProperty(key)) {
                            result[key] = {};
                        }

                        if (isDefault === true) {
                            result[key].content = value;
                        } else {
                            result[key][newKey] = value;
                        }
                    }
                }

                return result;
            },

            /**
             * Build config of SEO form with REST data
             * @param {Object} metadata
             * @param {Object} popin
             * @returns {Object}
             */
            buildConfigSeoForm: function (metadata, popin) {
                var self = this,
                    key,
                    value,
                    config = {},
                    meta;

                config.onSubmit = function (data) {
                    popin.mask();
                    PageRepository.setMetadata(self.currentPage.uid, self.computeSeoData(data)).done(function () {
                        popin.unmask();
                        popin.hide();
                    });
                };

                config.elements = {};
                for (key in metadata) {
                    if (metadata.hasOwnProperty(key)) {
                        meta = metadata[key];
                        if (meta.hasOwnProperty('content')) {
                            config.elements[key] = {
                                label: key,
                                type: 'textarea',
                                value: meta.content
                            };

                            for (value in meta) {
                                if (meta.hasOwnProperty(value)) {
                                    if (value !== 'content') {
                                        config.elements[key + '__' + value] = {
                                            label: value,
                                            type: 'textarea',
                                            value: meta[value],
                                            group: key
                                        };

                                        config.elements[key].label = 'Content';
                                        config.elements[key].group = key;
                                    }
                                }
                            }
                        }
                    }
                }

                return config;
            },

            /**
             * Render the template into the DOM with the Renderer
             * @returns {Object} PageViewContributionIndex
             */
            render: function () {
                var self = this;

                PageRepository.getWorkflowState(this.currentPage.layout_uid).done(function (workflowStates) {
                    jQuery(self.el).html(Renderer.render(template, {'page': self.currentPage, 'states': workflowStates}));
                    self.bindEvents();
                    self.setStateScheduling(self.currentPage);
                }).fail(function (e) {
                    console.log(e);
                });
            }
        });

        return PageViewContributionIndex;
    }
);