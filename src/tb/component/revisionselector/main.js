/*
 * Copyright (c) 2011-2013 Lp digital system
 *
 * This file is part of BackBee.
 *
 * BackBuilder5 is free software: you can redistribute it and/or modify
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

require.config({
    paths: {

        //Templates
        'revisionselector.templates': 'src/tb/component/revisionselector/templates',

        //Managers
        'revisionselector.managers': 'src/tb/component/revisionselector/managers'
    }
});

define(
    'tb.component/revisionselector/main',
    [
        'tb.core.Renderer',
        'tb.core.ApplicationManager',
        'text!revisionselector.templates/tree.twig',
        'component!popin',
        'revisionselector.managers/Draft',
        'revisionselector.managers/Event',
        'revisionselector.managers/Save',
        'jquery',
        'jsclass'
    ],
    function (
        Renderer,
        ApplicationManager,
        treeTemplate,
        PopinManager,
        DraftManager,
        EventManager,
        SaveManager,
        jQuery
    ) {

        'use strict';

        var popinConfig = {
                width: 944,
                height: 'auto'
            },

            RevisionManager = new JS.Class({

                revisionSelectorClass: '.bb-revision-selector',

                /**
                 * Initialize of Revision manage
                 */
                initialize: function (config) {
                    var self = this;

                    this.config = config;

                    this.buildPopin();

                    this.selector = '#' + this.popin.getId() + ' ' + this.revisionSelectorClass;

                    ApplicationManager.invokeService('content.main.getRepository').done(function (repository) {
                        self.repository = repository;
                    });
                },

                /**
                 * Build the popin
                 */
                buildPopin: function () {
                    var title = (this.config.popinTitle !== undefined) ? this.config.popinTitle : '';

                    this.popin = PopinManager.createPopIn();
                    this.popin.setTitle(title);
                    this.popin.addOptions(popinConfig);
                    this.popin.addButton('Save', jQuery.proxy(this.save, this));
                },

                /**
                 * Apply the save to the callback
                 */
                save: function () {
                    if (this.config.hasOwnProperty('onSave')) {
                        this.config.onSave(SaveManager.save(this.selector), this.popin);
                    }
                },

                /**
                 * Show popin with revisions
                 */
                show: function () {
                    var self = this;

                    this.popin.display();

                    this.repository.getDrafts().done(function (drafts) {
                        self.popin.setContent(Renderer.render(treeTemplate, {items: DraftManager.computeDraft(drafts), title: self.config.title}));
                        EventManager.init(self.selector);
                    });
                }
            });

        return RevisionManager;
    }
);
