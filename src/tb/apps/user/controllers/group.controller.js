/*
 * Copyright (c) 2011-2013 Lp digital system
 *
 * This file is part of BackBuilder5.
 *
 * BackBuilder5 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BackBuilder5 is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with BackBuilder5. If not, see <http://www.gnu.org/licenses/>.
 */

define(
    ['Core', 'Core/Renderer', 'component!notify', 'Core/Utils'],
    function (Core, renderer, Notify, Utils) {
        'use strict';
        var trans = Core.get('trans') || function (value) {return value; };

        Core.ControllerManager.registerController('GroupController', {

            appName: 'user',

            config: {
                imports: ['user/repository/group.repository'],
                define: {
                    indexService: ['user/repository/group.repository', 'user/views/group/view.list', 'text!user/templates/group/list.twig'],
                    newService: ['user/views/group/form.view'],
                    editService: ['user/views/group/form.view'],
                    duplicateService: ['user/views/group/duplicate.view'],
                    deleteService: ['user/views/group/delete.view'],
                    showUsersService: ['user/repository/user.repository', 'user/views/user/view.list', 'text!user/templates/user/list.twig']
                }
            },

            /**
             * Initialize of Page Controller
             */
            onInit: function (req) {
                this.repository = req('user/repository/group.repository');
            },

            /**
             * Index action
             * Show the index in the edit contribution toolbar
             */
            indexService: function (req, popin) {
                var View = req('user/views/group/view.list'),
                    template = req('text!user/templates/group/list.twig');


                this.repository.paginate().then(
                    function (groups) {
                        var i;
                        groups = Utils.castAsArray(groups);

                        for (i = 0; i < groups.length; i = i + 1) {
                            groups[i] = new View({group: groups[i]});
                        }

                        popin.addGroups(renderer.render(template, {groups: groups}));
                    },
                    function () {
                        popin.addGroups('');
                        Core.exception.silent('GroupControllerEception', 500, 'Group REST paginate call fail');
                    }
                );
            },

            initFormView: function (group, popin, View) {
                var self = this,
                    view = new View({group: group});

                view.display().then(function (group) {
                    self.repository.save(group).then(
                        function () {
                            self.indexService(require, popin);
                            Notify.success(trans('Group save success.'));
                        },
                        function () {
                            Notify.error(trans('Group save fail.'));
                        }
                    );
                });
            },

            newService: function (req, popin) {
                this.initFormView({}, popin, req('user/views/group/form.view'));
            },

            editService: function (req, popin, group_id) {
                var self = this;

                this.repository.find(group_id).done(function (group) {
                    self.initFormView(group, popin, req('user/views/group/form.view'));
                });
            },

            deleteService: function (req, popin, group_id) {
                var self = this,
                    View = req('user/views/group/delete.view'),
                    view;

                this.repository.find(group_id).done(function (group) {

                    view = new View({popin: popin, group: group});
                    view.display().then(
                        function () {
                            self.repository.delete(group_id).done(function () {
                                self.indexService(require, popin);
                                Notify.success(trans('group') + ' ' + group.name + ' ' + trans('has been deleted.'));
                            });
                            view.destruct();
                        },
                        function () {
                            view.destruct();
                        }
                    );
                });
            },

            showUsersService: function (req, main_popin, group_id) {
                req('user/repository/user.repository').findBy({'groups': group_id}).then(
                    function (users) {
                        var View = req('user/views/user/view.list'),
                            tpl = req('text!user/templates/user/list.twig'),
                            popin = main_popin.popinManager.createSubPopIn(
                                main_popin.popin,
                                {
                                    id: 'new-user-subpopin',
                                    width: 250,
                                    top: 180,
                                    dialogClass: "list-display-dropdown",
                                    close: function () {
                                        main_popin.popinManager.destroy(popin);
                                    }
                                }
                            ),
                            i;

                        users = Utils.castAsArray(users);

                        for (i = users.length - 1; i >= 0; i = i - 1) {
                            users[i] = new View({user: users[i]});
                        }

                        popin.setContent(renderer.render(tpl, {users: users}));

                        popin.display();
                    },
                    function () {
                        Notify.success(trans('group request fail'));
                    }
                );
            }
        });
    }
);