define([
    'tb.core',
    'content.dnd.manager',
    'content.mouseevent.manager',
    'content.save.manager',
    'content.manager',
    'content.view.contribution.index',
    'definition.manager',
    'content.repository',
    'revision.repository',
    'component!revisionselector',
    'jquery',
    'content.widget.DialogContentsList'
], function (
    Core,
    DndManager,
    MouseEventManager,
    SaveManager,
    ContentManager,
    ContributionIndexView,
    DefinitionManager,
    ContentRepository,
    RevisionRepository,
    RevisionSelector,
    jQuery,
    DialogContentsList
) {
    'use strict';

    Core.ControllerManager.registerController('MainController', {
        appName: 'content',

        EDITABLE_ELEMENTS: ['Element/Text'],

        config: {
            imports: ['content.repository'],
            define: {
                editionService: ['content.widget.Edition', 'content.manager']
            }
        },

        /**
         * Initialize of Bundle Controller
         */
        onInit: function () {
            this.repository = require('content.repository');
        },

        computeImagesInDOMService: function () {
            ContentManager.computeImages('body');
        },

        /**
         * Return the content repository
         */
        getRepositoryService: function () {
            return this.repository;
        },

        /**
         * Return the dialog content list widget
         */
        getDialogContentsListWidgetService: function () {
            return DialogContentsList;
        },

        /**
         * Return the definition manager
         */
        getDefinitionManagerService: function () {
            return DefinitionManager;
        },

        /**
         * Return the definition manager
         */
        getContentManagerService: function () {
            return ContentManager;
        },

        editionService: function (req) {
            var EditionHelper = req('content.widget.Edition'),
                ContentHelper = req('content.manager');

            return {
                EditionHelper: EditionHelper,
                ContentHelper: ContentHelper
            };
        },

        /**
         * Call method save into SaveManager
         */
        saveService: function () {
            return SaveManager.save();
        },

        /**
         * Show the revision selector
         * @returns {undefined}
         */
        cancelService: function () {
            var config = {
                popinTitle: 'Cancel Confirmation',
                title: 'Cancel changes content below :',
                onSave: function (data, popin) {
                    popin.mask();
                    RevisionRepository.save(data, 'revert').done(function () {
                        popin.hide();
                    });
                }

            };

            new RevisionSelector(config).show();
        },

        /**
         * Show the revision selector
         * @returns {undefined}
         */
        validateService: function () {
            var config = {
                popinTitle: 'Saving Confirmation',
                title: 'Confirm saving changes content below :',
                onSave: function (data, popin) {
                    popin.mask();
                    RevisionRepository.save(data, 'commit').done(function () {
                        popin.hide();
                    });
                }
            };

            new RevisionSelector(config).show();
        },

        getEditableContentService: function (content) {
            var self = this,
                dfd = new jQuery.Deferred(),
                element,
                result = [];

            if (jQuery.inArray(content.type, this.EDITABLE_ELEMENTS) !== -1) {
                result.push(content);
                dfd.resolve(result);
            } else {
                content.getData('elements').done(function (elements) {
                    jQuery.each(elements, function (subContentName) {
                        element = elements[subContentName];
                        if (jQuery.inArray(element.type, self.EDITABLE_ELEMENTS) === -1) {
                            return true;
                        }
                        result.push(ContentManager.buildElement(element));
                    });
                    dfd.resolve(result);
                });
            }

            return dfd.promise();
        },

        contributionIndexAction: function () {
            var self = this;
            Core.Scope.register('contribution', 'block');
            DndManager.initDnD();
            if (this.contribution_loaded !== true) {
                ContentRepository.findCategories().done(function (categories) {
                    var view = new ContributionIndexView({
                        'categories': categories
                    });
                    view.render();

                    self.contribution_loaded = true;
                });
            }
        },

        contributionEditAction: function () {
            Core.Scope.register('contribution', 'content');
        },

        createView: function (Constructor, config, render) {
            var view = new Constructor(config);

            if (render) {
                view.render();
            }
        },

        findDefinitionsService: function (page_uid) {
            return this.repository.findDefinitions(page_uid);
        },

        listenDOMService: function (definitions) {
            DefinitionManager.setDefinitions(definitions);

            Core.Scope.subscribe('contribution', function () {
                DndManager.bindEvents();
                MouseEventManager.enable(true);
            }, function () {
                DndManager.unbindEvents();
                MouseEventManager.enable(false);
            });

            MouseEventManager.listen();
        }
    });
});
