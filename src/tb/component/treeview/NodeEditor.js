define(['jquery', 'BackBone', 'jsclass'], function (jQuery, BackBone) {
    'use strict';
    var NodeEditor = new JS.Class({
        CREATION_MODE: "create",
        initialize: function (tree) {
            this.tree = tree;
            this.currentNode = null;
            this.isEditing = false;
            jQuery.extend(this, {}, BackBone.Events);
            this.formWrapper = this.createEditForm();
            this.editField = this.formWrapper.find('input').eq(0);
            this.bindEvents();
        },

        handleEdition: function () {
            var nodeValue = this.editField.val(),
                parentNode = null;
            this.currentNode.title = nodeValue;
            this.tree.invoke('updateNode', this.currentNode, nodeValue);
            this.formWrapper.hide();
            if (this.mode === this.CREATION_MODE) {
                parentNode = this.currentNode.parent;
                if (this.tree.isRoot(parentNode)) {
                    parentNode = null;
                }
            }
            this.trigger("editNode", jQuery.proxy(this.onEditCallback, this), this.currentNode, nodeValue, parentNode, this.tree);
        },

        onEditCallback: function (node) {
            if (this.mode === this.CREATION_MODE) {
                var editedNode = this.getEditedNode();
                /* replace editable node */
                node.label =  node.title;
                node.isLoaded = true;
                this.tree.addNode(node, 'before', editedNode);
                this.tree.removeNode(editedNode);
            }
        },

        getEditedNode: function () {
            return this.tree.getNodeById('node-editor');
        },

        createNode: function () {
            this.mode = this.CREATION_MODE;
            var selectedNode = this.tree.getSelectedNode(),
                node;
            if (this.isEditing) {
                return;
            }
            this.tree.appendNode({
                id: 'node-editor',
                label: ''
            }, selectedNode);
            /* opennode here */
            selectedNode.hasFormNode = true; //hack
            if (!this.tree.isNodeOpened(selectedNode)) {
                this.tree.invoke('openNode', selectedNode);
            }

            node = this.tree.getNodeById('node-editor');
            this.edit(node);
        },

        bindEvents: function () {
            jQuery(this.tree.el).on('click', '.save-btn', jQuery.proxy(this.handleEdition, this));
            jQuery(this.tree.el).on('click', '.cancel-btn', jQuery.proxy(this.cancelEdition, this));
        },

        createEditForm: function () {
            var divHtml = '<li class="jq-tree-editor"><input class="tree-editing-field"/> <i class="fa save-btn fa-check"></i> <i class="fa cancel-btn fa-close"></i></li>';
            return jQuery(divHtml);
        },

        edit: function (node) {
            if (this.isEditing) {
                jQuery(this.currentNode.element).show();
            }
            if (!node) {
                return false;
            }
            this.isEditing = true;
            this.currentNode = node;
            jQuery(node.element).hide();
            jQuery(node.element).after(this.formWrapper.show());
            this.editField.val(this.currentNode.title);
            this.editField.focus();
        },

        cancelEdition: function () {
            var node = this.tree.getNodeById('node-editor');
            this.tree.removeNode(node);
            this.isEditing = false;
            jQuery(this.currentNode.element).show();
            //this.formWrapper.remove();
        }
    });
    return NodeEditor;
});