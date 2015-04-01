define([
    'jquery',
    'page.repository',
    'tb.core.Renderer',
    'text!page/tpl/manage_list'

], function (jQuery, PageRepository, Renderer, template) {

    'use strict';

    /**
     * View of new page
     * @type {Object} Backbone.View
     */
    var PageViewReview = Backbone.View.extend({

        /**
         * Initialize of PageViewReview
         */
        initialize: function (parent_uid) {
            this.parent_uid = parent_uid;

            this.popin = require('component!popin').createPopIn();
        },

        computeLayouts: function (layouts) {
            var key,
                layout,
                data = {'': ''};

            for (key in layouts) {
                if (layouts.hasOwnProperty(key)) {
                    layout = layouts[key];
                    data[layout.uid] = layout.label;
                }
            }

            return data;
        },

        onSubmit: function (data) {
            var self = this;

            if (typeof this.parent_uid === 'string') {
                data.parent_uid = this.parent_uid;
            }

            PageRepository.save(data, function () {
                self.popin.hide();
            });
        },

        onValidate: function (form, data) {
            if (!data.hasOwnProperty('layout_uid') || data.layout_uid.trim().length === 0) {
                form.addError('layout_uid', 'Template is required.');
            }
        },

        /**
         * Render the template into the DOM with the Renderer
         * @returns {Object} PageViewReview
         */
        render: function () {
            var self = this;

            self.popin.setTitle('Review pages');
            self.popin.setContent('');
            self.popin.addOptions({
                "height" : 700 > jQuery(window).height() - 40 ? jQuery(window).height() - 40 : 700,
                "width" : 1244 > jQuery(window).width() - 40 ? jQuery(window).width() - 40 : 1244
            });
            self.popin.display();
            self.popin.mask();


            PageRepository.search({state: 1}, 0, 50).done(function (pages) {
                var content = Renderer.render(template, {"pages": pages});
                self.popin.setContent(content);

                jQuery('#content-library-pane-wrapper').layout({
                    applyDefaultStyles: true,
                    closable: false
                });

                self.popin.unmask();
            });

            return this;
        }
    });

    return PageViewReview;
});