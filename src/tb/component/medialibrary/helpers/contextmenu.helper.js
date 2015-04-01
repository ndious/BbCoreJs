define(['component!contextmenu', 'jquery', 'component!notify'], function (ContextMenu, jQuery, notify) {
    'use strict';
    var treeView = null,
        contextMenu = null,
        selectedNode = null,
        mainWidget = null,
        mediaFolderStore = null,
        cuttedNode = null,
        buildContextMenu = function () {
            var mediaFolderContextMenu = new ContextMenu({domTag: "#bb5-ui"}),
                actions = {
                    createAction: function () {
                        treeView.createNode();
                    },

                    editAction: function () {
                        treeView.editNode(selectedNode);
                    },

                    removeAction: function () {
                        mediaFolderStore.remove(selectedNode).done(function () {
                            treeView.removeNode(selectedNode);
                        }).fail(function (response) {
                            notify.error(response);
                        });
                    },

                    cutAction: function () {
                        cuttedNode = selectedNode;
                    },

                    showMediaFormAction: function (mediaType) {
                        mainWidget.showMediaEditForm(mediaType);
                    },

                    pasteAction: function (position) {
                        var data = {},
                            nextSibling,
                            moveNode = jQuery.proxy(function (cuttedNode, selectedNode, position) {
                                treeView.moveNode(cuttedNode, selectedNode, position);
                            }, this, cuttedNode, selectedNode, position);
                        if (position === "before") {
                            data.sibling_uid = selectedNode.uid;
                        }
                        if (position === 'append') {
                            data.parent_uid = selectedNode.uid;
                        }
                        if (position === "after") {
                            nextSibling = cuttedNode.getNextSibling();
                            if (nextSibling) {
                                data.sibling_uid = nextSibling.uid;
                            } else {
                                data.parent_uid = cuttedNode.parent.uid;
                            }
                        }
                        mediaFolderStore.moveNode(cuttedNode, data).done(function () {
                            moveNode();
                        }).fail(function (reponse) {
                            notify.error(reponse);
                        });
                        cuttedNode = null;
                    }
                },
                nomalizeMediaType = function (name) {
                    return name.replace('/', '-');
                },

                buildMediaItems = function (contextMenu, mediaList) {
                    var item;
                    if (jQuery.isArray(mediaList)) {
                        jQuery.each(mediaList, function (i) {
                            item = mediaList[i];
                            contextMenu.addMenuItem({
                                btnCls: "bb5-contextmenu-" + nomalizeMediaType(item.type),
                                btnLabel: "create a new " + item.title,
                                btnCallback: jQuery.proxy(actions.showMediaFormAction, this, item.type)
                            });
                        });
                    }
                };
            mediaFolderContextMenu.beforeShow = function () {
                if (!selectedNode.isleaf && !treeView.isNodeOpened(selectedNode) && !selectedNode.isLoaded) {
                    this.addFilter("bb5-context-menu-add");
                }
                if (!cuttedNode || (cuttedNode.uid === selectedNode.uid)) {
                    this.addFilter("bb5-context-menu-paste");
                    this.addFilter("bb5-context-menu-paste-before");
                    this.addFilter("bb5-context-menu-paste-after");
                }
                if (cuttedNode && cuttedNode.uid === selectedNode.uid) {
                    this.addFilter("bb5-context-menu-cut");
                }
                if (treeView.isRoot(selectedNode)) {
                    this.addFilter("bb5-context-menu-cut");
                    this.addFilter("bb5-context-menu-remove");
                    this.addFilter("bb5-context-menu-paste-before");
                    this.addFilter("bb5-context-menu-paste-after");
                }
            };

            mediaFolderContextMenu.addMenuItem({
                btnCls: "bb5-context-menu-add",
                btnLabel: "Create",
                btnCallback: actions.createAction
            });

            mediaFolderContextMenu.addMenuItem({
                btnCls: "bb5-context-menu-edit",
                btnLabel: "Edit",
                btnCallback: actions.editAction
            });

            mediaFolderContextMenu.addMenuItem({
                btnCls: "bb5-context-menu-remove",
                btnLabel: "Remove",
                btnCallback: actions.removeAction
            });

            mediaFolderContextMenu.addMenuItem({
                btnCls: "bb5-context-menu-cut",
                btnLabel: "Cut",
                btnCallback: actions.cutAction
            });

            mediaFolderContextMenu.addMenuItem({
                btnCls: "bb5-context-menu-paste-before",
                btnLabel: "Paste Before",
                btnCallback: jQuery.proxy(actions.pasteAction, this, "before")
            });

            mediaFolderContextMenu.addMenuItem({
                btnCls: "bb5-context-menu-paste",
                btnLabel: "Paste",
                btnCallback: jQuery.proxy(actions.pasteAction, this, "append")
            });

            mediaFolderContextMenu.addMenuItem({
                btnCls: "bb5-context-menu-paste-after",
                btnLabel: "Paste After",
                btnCallback: jQuery.proxy(actions.pasteAction, this, "after")
            });

            buildMediaItems(mediaFolderContextMenu, mainWidget.getAvailableMedia());
            mediaFolderContextMenu.enable();
            return mediaFolderContextMenu;
        };
    return {
        setMainWidget: function (widget) {
            treeView = widget.mediaFolderTreeView;
            mediaFolderStore = widget.mediaFolderDataStore;
            mainWidget = widget;
        },
        setSelectedNode: function (node) {
            selectedNode = node;
        },
        getContextMenu: function () {
            if (!contextMenu) {
                contextMenu = buildContextMenu();
            }
            return contextMenu;
        }
    };
});