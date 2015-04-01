/*global CKEDITOR:false */
define(['tb.core.Utils', 'tb.core.ApplicationManager', 'jquery', 'component!rtemanager'], function (Utils, ApplicationManager, jQuery, RteManager) {
    "use strict";
    return RteManager.createAdapter("cke", {
        onInit: function () {
            this.editors = [];
            this.editableConfig = {};
            this.conciseInfos = {};
            this.editorContainer = "#content-contrib-tab";
            var lib = [],
                self = this;
            if (this.config.hasOwnProperty("libName")) {
                lib.push(this.config.libName);
            }
            if (this.config.hasOwnProperty("editableConfig")) {
                this.editableConfig = this.config.editableConfig;
            }
            Utils.requireWithPromise(lib).done(function () {
                self.editor = CKEDITOR;
                self.editor.disableAutoInline = true;
                self.editor.dtd.$editable.span = 1;
                self.editor.dtd.$editable.a = 1;
                /* extends CKEditor config with user config here*/
                jQuery.extend(self.editor.config, self.config);
                CKEDITOR.on("instanceReady", jQuery.proxy(self.handleInstance, self));
                CKEDITOR.on("currentInstance", function () {
                    self.stickEditor({
                        editor: CKEDITOR.currentInstance
                    });
                });
                self.triggerOnReady(self);
            });
        },



        stickEditor: function (e) {
            if (!e.editor) {
                return;
            }
            var editorHtml = jQuery("#cke_" + e.editor.name);
            if (jQuery(this.editorContainer).find(editorHtml).length) {
                return;
            }
            jQuery(this.editorContainer).css({
                padding: "5px",
                width: "552px",
                height: "90px"
            });
            jQuery(this.editorContainer).append(editorHtml);
        },

        getEditableContents: function (content) {
            var dfd = new jQuery.Deferred(),
                self = this;
            if (!this.conciseInfos.hasOwnProperty(content.uid)) {
                ApplicationManager.invokeService('content.main.getEditableContent', content).done(function (promise) {
                    promise.done(function (editableContents) {
                        self.conciseInfos[content.uid] = editableContents;
                        dfd.resolve(editableContents);
                    });
                });
            } else {
                dfd.resolve(self.conciseInfos[content.uid]);
            }
            return dfd.promise();
        },

        applyToContent: function (content) {
            var self = this,
                editable;
            this.getEditableContents(content).done(function (editableContents) {
                jQuery.each(editableContents, function (i) {
                    editable = editableContents[i];
                    self.applyToElement(editable.jQueryObject);
                });
            });
        },

        handleInstance: function (event) {
            var self = this,
                editor = event.editor;
            this.editors.push(editor);
            editor.on("blur", function (evt) {
                if (evt.editor.checkDirty()) {
                    self.triggerOnEdit({
                        node: evt.editor.container.$,
                        data: evt.editor.getData()
                    });
                    /* save value here */
                    ApplicationManager.invokeService('content.main.getContentManager').done(function (ContentManager) {
                        var content = ContentManager.getContentByNode(jQuery(evt.editor.container.$));
                        content.set('value', evt.editor.getData());
                    });
                }
            });
        },

        applyToElement: function (element) {
            if (jQuery(element).hasClass("cke_editable_inline")) {
                return true;
            }
            jQuery(element).attr("contenteditable", true);
            var conf = jQuery(element).data('rteConfig') || 'basic',
                rteConfig = this.editableConfig[conf];
            this.editor.inline(jQuery(element).get(0), rteConfig);
        },

        enable: function () { this.callSuper(); },

        disable: function () {
            var self = this,
                editable;
            jQuery.each(this.editors, function (i) {
                editable = self.editors[i];
                jQuery(editable.container.$).removeClass("cke_editable cke_editable_inline");
                jQuery(editable.container.$).removeAttr("contenteditable");
                editable.destroy();
            });
            this.editors = [];
        },

        getEditor: function () {
            return this.editor;
        }
    });
});