define(['jquery', 'text!content/tpl/content-action', 'jsclass'], function (jQuery, template) {
    'use strict';
    var ContentActionWidget = new JS.Class({
        initialize: function () {
            this.content = null;
            this.widget = jQuery(template).clone();
            jQuery(this.widget).addClass('content-actions');
        },

        setContent: function (content) {
            this.content = content;
        },

        /*  listen to context */
        appendActions: function (actionArr, clean) {
            if (clean) {
                this.cleanActions();
            }
            var buttonNode = this.buildAction(actionArr);
            this.widget.append(buttonNode);
        },

        isBuild: function (content) {
            return content.jQueryObject.find('.content-actions').length > 0;
        },

        cleanActions: function () {
            this.widget.empty();
        },

        show: function () {
            jQuery(this.content).append(this.widget);
        },

        hide: function () {
            this.widget.empty();
        },

        buildAction: function (actions) {
            actions = (jQuery.isArray(actions)) ? actions : [actions];
            var actionInfos,
                btnCtn = document.createDocumentFragment();
            jQuery.each(actions, function (i) {
                actionInfos = actions[i];

                var button = jQuery("<a></a>").clone();
                button.attr("title", actionInfos.label);
                button.attr('draggable', 'true');
                button.addClass(actionInfos.ico);
                jQuery(button).on("click", actionInfos.cmd.execute);
                btnCtn.appendChild(jQuery(button).get(0));
            });
            return btnCtn;
        }
    });
    return ContentActionWidget;
});
