define(['content.pluginmanager', 'jquery'], function (PluginManager, jQuery) {
    'use strict';
    PluginManager.registerPlugin("quickedit", {
        scope: PluginManager.scope.BLOCK,

        onInit: function () {

            this.bindEvents();
        },

        switchContext: function () {
            document.location.href = '#content/contribution/edit';
        },

        bindEvents: function () {
            var self = this,
                element = this.getCurrentContentNode();

            jQuery(element).on('dblclick', function () {
                if (!self.canApplyOnContext()) {
                    return false;
                }
                self.switchContext();
            });
        },

        canApplyOnContext: function () {
            return this.context.scope === 'contribution.block';
        }
    });
});