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

/*global Dropzone */
define(['tb.core', 'tb.core.Renderer', 'BackBone', 'jquery'], function (Core, Renderer, Backbone, jQuery) {
    'use strict';

    var FileView = Backbone.View.extend({

        mainSelector: Core.get('wrapper_toolbar_selector'),
        dropzoneSelector: '.dropzone-file',

        defaultDropzoneConfig: {
            url: Core.get('api_base_url') + '/resource/upload',
            dictDefaultMessage: 'Drop files here or click to upload.',
            addRemoveLinks: true,
            maxFiles: 1,
            thumbnailWidth: 200
        },

        initialize: function (template, formTag, element) {
            this.form = formTag;
            this.template = template;
            this.element = element;

            this.uploadEvent();
        },

        uploadEvent: function () {
            var self = this,
                config = {};

            jQuery.extend(config, this.defaultDropzoneConfig, this.element.config.dropzone);

            Core.Mediator.subscribeOnce('on:form:render', function (form) {
                var dropzone = new Dropzone(form.find(self.dropzoneSelector).eq(0).get(0), config),
                    element = form.find('input[name=' + self.element.getKey() + ']'),
                    elementPath = form.find('span.' + self.element.getKey() + '_path'),
                    elementSrc = form.find('span.' + self.element.getKey() + '_src'),
                    elementOriginalName = form.find('span.' + self.element.getKey() + '_originalname');

                self.buildValue(dropzone, self.element.value, element);

                dropzone.on('success', function (file, response) {
                    elementPath.text(response.path);
                    elementOriginalName.text(response.originalname);

                    if (response.src !== undefined) {
                        elementSrc.text(response.src);
                    }

                    element.val('uploaded');

                    return file;
                });

                dropzone.on('removedfile', function () {
                    if (this.files.length === 0) {
                        elementPath.text('');
                        elementSrc.text('');
                        elementOriginalName.text('');
                        element.val('');
                    }
                });

                dropzone.on('maxfilesexceeded', function (file) {
                    this.removeFile(file);
                });
            });
        },

        buildValue: function (dropzone, value, element) {

            if (typeof value === 'object') {
                var file = {'name': value.name};

                dropzone.options.addedfile.call(dropzone, file);
                dropzone.createThumbnailFromUrl(file, value.thumbnail);

                element.val(value.path);
            }
        },

        /**
         * Render the template into the DOM with the Renderer
         * @returns {String} html
         */
        render: function () {
            return Renderer.render(this.template, {element: this.element, id: this.id});
        }
    });

    return FileView;
});