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
        'tb.core.ApplicationManager',
        'jquery',
        'content.manager',
        'content.container',
        'component!popin',
        'component!contentformbuilder',
        'component!formbuilder'
    ],
    function (ApplicationManager, jQuery, ContentManager, ContentContainer, PopinManager, ContentFormBuilder, FormBuilder) {

        'use strict';

        var Edition = {

            contentSetClass: '.contentset',
            config: {onSave: null},

            show: function (content, config) {
                this.config = config || {};
                if (content !== undefined) {
                    this.content = content;
                    this.createPopin();
                    this.edit();
                }
            },

            createPopin: function () {
                if (this.popin) {
                    this.popin.destroy();
                }
                this.popin = PopinManager.createPopIn();
                this.popin.setTitle('Edit');
                this.popin.addOption('width', '500px');
            },

            getDialog: function () {
                var dialog = this.popin || null;
                return dialog;
            },

            getFormConfig: function () {

                var self = this,
                    dfd = new jQuery.Deferred();

                this.content.getData('elements').done(function (elements) {

                    var key,
                        object,
                        element,
                        elementArray = [];

                    for (key in elements) {
                        if (elements.hasOwnProperty(key)) {

                            element = elements[key];
                            object = {
                                'type': element.type,
                                'uid': element.uid,
                                'name': key
                            };

                            elementArray.push(object);
                        }
                    }

                    self.getElementsConfig(elementArray).done(function () {
                        dfd.resolve(self.buildConfig(arguments));
                    });
                });

                return dfd.promise();
            },

            buildConfig: function (parameters) {
                var key,
                    param,
                    config = {
                        'elements': {},
                        'onSubmit': jQuery.proxy(this.onSubmit, this)
                    };

                for (key in parameters) {
                    if (parameters.hasOwnProperty(key)) {
                        param = parameters[key];

                        if (param !== null) {
                            param.popinInstance = this.popin;
                            config.elements[param.object_name] = param;
                        }
                    }
                }

                return config;
            },

            getElementsConfig: function (elementsArray) {

                var key,
                    promises = [],
                    object;

                for (key in elementsArray) {
                    if (elementsArray.hasOwnProperty(key)) {

                        object = elementsArray[key];

                        promises.push(ContentFormBuilder.getConfig(object.type, object));
                    }
                }

                return jQuery.when.apply(undefined, promises).promise();
            },

            /**
             * Edit the content
             */
            edit: function () {
                var self = this;

                this.popin.display();
                this.popin.mask();

                this.getFormConfig().done(function (config) {
                    FormBuilder.renderForm(config).done(function (html) {
                        self.popin.setContent(html);
                        self.popin.unmask();
                    });
                });
            },

            onSubmit: function (data, form) {
                var self = this;

                this.computeData(data, form);
                this.computeContentSet(form);

                ApplicationManager.invokeService('content.main.save').done(function (promise) {
                    promise.done(function () {
                        if (typeof self.config.onSave === "function") {
                            self.config.onSave(data);
                        }
                        self.content.refresh().done(function () {
                            self.content.refresh();

                            ContentContainer.clear();

                            self.popin.hide();
                        });
                        self.config.onSave = null;
                    });
                });
            },

            computeImage: function (key, value, element, formObject) {
                var elements = {},
                    form = jQuery('#' + formObject.id),
                    elementPath = form.find('span.' + key + '_path'),
                    elementSrc = form.find('span.' + key + '_src'),
                    elementOriginalName = form.find('span.' + key + '_originalname');

                if (value === 'uploaded') {
                    elements.path = elementPath.text();
                    elements.originalname = elementOriginalName.text();

                    if (elementSrc.text().length > 0) {
                        elements.src = elementSrc.text();
                    }

                    element.setElements(elements);
                }
            },

            computeContentSet: function (form) {
                var self = this,
                    formElement = jQuery('#' + form.id),
                    contentSets = formElement.find(this.contentSetClass);

                contentSets.each(function () {
                    var contentSetElement = jQuery(this),
                        uid = contentSetElement.data('uid'),
                        type = contentSetElement.data('type'),
                        contentSet = ContentManager.buildElement({'uid': uid, 'type': type}),
                        elements = self.buildContentSetElements(contentSetElement);

                    self.compareElements(contentSet, elements);
                });
            },

            compareElements: function (contentSet, elements) {
                var currentElements = contentSet.data.elements,
                    i,
                    doSet = false;

                if (currentElements.length !== elements.length) {
                    doSet = true;
                } else {
                    for (i = 0; i < elements.length; i = i + 1) {
                        if (elements[i].uid !== currentElements[i].uid) {
                            doSet = true;
                            break;
                        }
                    }
                }

                if (doSet === true) {
                    contentSet.setElements(elements);
                }

            },

            buildContentSetElements: function (contentSetElement) {
                var li = contentSetElement.find('li'),
                    elements = [];

                li.each(function () {
                    var $li = jQuery(this);

                    elements.push({'uid': $li.data('uid'), 'type': $li.data('type')});
                });

                return elements;
            },

            computeData: function (data, form) {
                var element,
                    contentElements = this.content.data.elements,
                    key,
                    item,
                    value;

                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        value = data[key];
                        item = contentElements[key];

                        element = ContentManager.buildElement(item);

                        if (element.type === 'Element/Image') {
                            this.computeImage(key, value, element, form);
                        } else {
                            if (element.get('value') !== value) {
                                element.set('value', value);
                            }
                        }
                    }
                }
            }
        };

        return {
            show: jQuery.proxy(Edition.show, Edition),
            getDialog: jQuery.proxy(Edition.getDialog, Edition)
        };
    }
);