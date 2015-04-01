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
        'content.pluginmanager',
        'component!popin',
        'component!formbuilder',
        'definition.manager',
        'jsclass'
    ],
    function (PluginManager, Popin, FormBuilder, DefinitionManager) {

        'use strict';

        PluginManager.registerPlugin('parameters', {

            /**
             * Initialization of plugin
             */
            onInit: function () {
                this.createPopin();
            },

            /**
             * Create popin for parameters form
             */
            createPopin: function () {
                this.popin = Popin.createPopIn();
                this.popin.setTitle('Parameters');
            },

            /**
             * Build form from parameters and show popin
             */
            showParameters: function () {
                var self = this,
                    content = this.getCurrentContent();

                content.getData().done(function () {
                    var parameters = content.getParameters(),
                        config = {
                            elements: self.computeParameters(parameters),
                            onSubmit: function (data) {
                                if (Object.keys(data).length > 0) {
                                    content.setParameters(data);
                                }
                                self.popin.hide();
                            }
                        };

                    FormBuilder.renderForm(config).done(function (html) {
                        self.popin.setContent(html);
                        self.popin.display();
                    });
                });
            },

            /**
             * Verify if the plugin can be apply on the context
             * If content don't have parameters, the button is hidden
             * @returns {Boolean}
             */
            canApplyOnContext: function () {
                var content = this.getCurrentContent(),
                    definition = DefinitionManager.find(content.type),
                    result = false;

                if (Object.keys(this.computeParameters(definition.parameters)).length > 0) {
                    result = true;
                }

                return result;
            },

            /**
             * Verify if parameters have the mandatories attributes
             * @param {Object} parameters
             */
            computeParameters: function (parameters) {
                var key,
                    param;

                for (key in parameters) {
                    if (parameters.hasOwnProperty(key)) {
                        param = parameters[key];
                        if (!param.hasOwnProperty('type')) {
                            delete parameters[key];
                        }
                    }
                }

                return parameters;
            },

            /**
             * 
             * @returns {Array}
             */
            getActions: function () {
                var self = this;

                return [
                    {
                        name: 'parameters',
                        ico: 'fa fa-cog',
                        label: 'Parameters',
                        cmd: self.createCommand(self.showParameters, self),
                        checkContext: function () {
                            return true;
                        }
                    }
                ];
            }
        });
    }
);