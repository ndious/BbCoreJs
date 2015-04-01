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

(function () {

    'use strict';

    define(['tb.core.ApplicationManager', 'jquery'], function (ApplicationManager, jQuery) {

        var association = {
                'Element/Text': 'Text',
                'Element/Image': 'Image'
            };

        return {

            load: function (name, req, onload) {
                var self = this;

                ApplicationManager.invokeService('content.main.getDefinitionManager').done(function (DefinitionManager) {
                    var definition = DefinitionManager.find(name),
                        realName = association[name];

                    if (null !== definition) {

                        if (definition.properties.is_container === true) {
                            realName = 'ContentSet';
                        } else if (realName === undefined) {
                            realName = 'All';
                        }

                        if (null !== definition) {
                            req(['cf.edition.elements/' + realName], function (elementObject) {
                                self.getServices(elementObject.services).done(function () {

                                    var key,
                                        i = 0;

                                    for (key in elementObject.services) {
                                        if (elementObject.services.hasOwnProperty(key)) {
                                            elementObject[key] = arguments[i];
                                            i = i + 1;
                                        }
                                    }

                                    onload(elementObject.init(definition));
                                });
                            }, function () {
                                onload(null);
                            });
                        }
                    } else {
                        onload(null);
                    }

                });
            },

            getServices: function (services) {
                var key,
                    promises = [];

                for (key in services) {
                    if (services.hasOwnProperty(key)) {

                        promises.push(ApplicationManager.invokeService(services[key]));
                    }
                }

                return jQuery.when.apply(undefined, promises).promise();
            }
        };
    });
}());