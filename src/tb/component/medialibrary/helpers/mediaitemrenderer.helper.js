require.config({
    paths: {
        'item.templates': 'src/tb/component/medialibrary/templates/'
    }
});
define(['tb.core', 'nunjucks', 'jquery', 'component!popin', 'component!mask', 'jsclass', 'text!item.templates/media.viewmode.tpl', 'text!item.templates/media.deletemode.tpl', 'text!item.templates/media.editmode.tpl'], function (Api, nunjucks, jQuery, PopInManager, MaskManager) {
    'use strict';
    var MediaItemRenderer = new JS.Class({
        initialize: function () {
            this.mode = "editmode";
            this.templates = {
                'view': require('text!item.templates/media.viewmode.tpl'),
                'edit': require('text!item.templates/media.editmode.tpl'),
                'deleteContent': require('text!item.templates/media.deletemode.tpl')
            };
            this.mask = MaskManager.createMask({});
        },

        initPopin: function () {
            if (this.popin) {
                this.popin.destroy();
            }
            this.popin = PopInManager.createSubPopIn(this.selector.dialog, {
                modal: true,
                minHeight: 200,
                minWidth: 450,
                maxHeight: 500,
                maxWidth: 450
            });
            return this.popin;
        },

        setSelector: function (selector) {
            this.selector = selector;
        },

        getSelector: function () {
            return this.selector;
        },

        setMode: function (mode) {
            this.mode = mode;
        },

        hidePopin: function () {
            if (this.popin) {
                this.popin.destroy();
            }
        },

        bindItemEvents: function (item, itemData) {
            item = jQuery(item);
            item.on('click', '.show-media-btn', jQuery.proxy(this.handleMediaPreview, this, itemData));
            item.on('click', '.del-media-btn', jQuery.proxy(this.deleteMedia, this, itemData));
            item.on('click', '.edit-media-btn', jQuery.proxy(this.showMediaEditForm, this, itemData));
            item.on('click', '.addandclose-btn', jQuery.proxy(this.addAndClose, this, itemData));
            return item;
        },

        handleMediaPreview: function (media, e) {
            this.selector.hideEditForm();
            e.stopPropagation();
            var self = this;
            this.initPopin().setTitle("Media Preview");
            this.popin.setContent(jQuery("<p>Loading...</p>"));
            this.popin.display();
            this.popin.moveToTop();
            this.popin.mask();
            this.loadMediaPreview(media.content).done(function (content) {
                content = jQuery(content);
                content.removeClass();
                self.popin.setContent(content);
                self.popin.unmask();
            });
        },

        addAndClose: function (media, e) {
            e.stopPropagation();
            e.preventDefault();
            this.getSelector().selectItems(media);
            this.getSelector().close();
            return false;
        },

        loadMediaPreview: function (content) {
            return jQuery.ajax({
                dataType: 'html',
                url: "/rest/1/classcontent/" + content.type + "/" + content.uid
            });
        },

        showMediaEditForm: function (media, e) {
            this.hidePopin();
            e.stopPropagation();
            this.selector.showMediaEditForm(media.type, media);
        },

        checkOrphanedContents: function (content) {
            var self = this;
            jQuery.ajax({
                url: "/rest/1/page",
                data: {
                    content_uid: content.uid,
                    content_type: content.type
                }
            }).done(function (data) {
                data = data || [];
                var templateData = {
                    isOrphaned: (data.length === 0),
                    items: data
                };
                content = nunjucks.renderString(self.templates.deleteContent, templateData);
                self.popin.setContent(jQuery(content));
                self.addButtons();
                self.popin.display();
                self.popin.moveToTop();
            }).fail(function (response) {
                self.popin.unmask();
                Api.exception('MediaItemException', 57567, '[deleteMedia] MediaItemException error while deleting media ' + response);
            });
        },

        deleteMedia: function (media, e) {
            this.selector.hideEditForm();
            e.stopPropagation();
            this.media = media;
            this.initPopin();
            this.popin.setTitle('Delete media');
            this.popin.setContent("Loading...");
            this.popin.display();
            this.popin.moveToTop();
            this.checkOrphanedContents(media.content);
        },

        render: function (mode, item) {
            if (mode === 'list' || mode === 'grid') {
                mode = this.mode;
            }
            var template = this.templates[mode],
                data = nunjucks.renderString(template, item); //mode is unused
            return this.bindItemEvents(data, item);
        },

        addButtons: function () {
            var self = this;

            this.popin.addButton('Yes', function () {
                self.popin.mask();
                self.popin.setContent("<p>Please wait while the media is being deleted...</p>");
                self.selector.deleteMedia(self.media);
                self.popin.destroy();
            });
            this.popin.addButton("No", function () {
                self.popin.destroy();
            });
        }
    });
    return MediaItemRenderer;
});