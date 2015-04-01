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
    ['tb.core', 'tb.core.Renderer', 'user/entity/user', 'component!notify', 'require', 'tb.core.Utils', 'jquery'],
    function (Core, renderer, User, Notify, require, Utils, jQuery) {
        'use strict';
        var trans = Core.get('trans') || function (value) {return value; };

        Core.ControllerManager.registerController('UserController', {

            appName: 'user',

            pagination_params: null,

            config: {
                imports: ['user/repository/user.repository'],
                define: {
                    indexService: ['user/views/user/view.list', 'text!user/templates/user/list.twig'],
                    newService: ['user/views/user/form.view', 'user/form/new.user.form'],
                    editService:  ['user/views/user/form.view', 'user/form/edit.user.form'],
                    deleteService: ['user/views/user/delete.view'],
                    showCurrentService: ['user/views/user/toolbar'],
                    editCurrentService:  ['user/views/user/current.form.view', 'user/form/current.user.form'],
                    changePasswordService:  ['user/views/user/current.form.view', 'user/form/password.user.form'],
                    logoutService: ['component!session', 'tb.core.DriverHandler', 'tb.core.RestDriver']
                }
            },

            onInit: function (req) {
                this.repository = req('user/repository/user.repository');
            },

            parseRestError: function (error) {
                error = JSON.parse(error);
                return error.errors || undefined;
            },

            /**
             * Index action
             * Show the index in the edit contribution toolbar
             */
            indexService: function (req, popin, params) {
                var View = req('user/views/user/view.list'),
                    template = req('text!user/templates/user/list.twig');

                if (params !== undefined) {
                    if (params.reset === true) {
                        this.pagination_params = null;
                    } else {
                        this.pagination_params = params;
                    }
                }

                this.repository.paginate(this.pagination_params).then(
                    function (users) {
                        var i;

                        users = Utils.castAsArray(users);

                        for (i = users.length - 1; i >= 0; i = i - 1) {
                            users[i] = new View({user: users[i]});
                        }

                        popin.addUsers(renderer.render(template, {users: users}));
                    },
                    function () {
                        popin.addUsers('');
                        Core.exception.silent('UserControllerEception', 500, 'User REST paginate call fail');
                    }
                );
            },

            initFormView: function (user, popin, View, action, error) {
                var self = this,
                    view = new View({popin: popin, user: user, errors: error}, action),
                    user_id = user.id();

                view.display().then(function (user) {

                    self.repository.save(user.getObject()).then(
                        function () {
                            popin.popinManager.destroy(view.popin);
                            self.indexService(require, popin);
                            Notify.success(trans('User save success.'));
                        },
                        function (error) {
                            Notify.error(trans('User save fail.'));

                            if (undefined !== user_id) {
                                user.populate({id: user_id});
                            }

                            popin.popinManager.destroy(view.popin);
                            self.initFormView(user, popin, View, action, self.parseRestError(error));
                        }
                    );
                });
            },

            newService: function (req, popin) {
                this.initFormView(new User(), popin, req('user/views/user/form.view'), 'new');
            },

            editService: function (req, popin, user_id) {
                var user = new User(),
                    self = this;

                this.repository.find(user_id).done(function (user_values) {
                    user.populate(user_values);
                    self.initFormView(user, popin, req('user/views/user/form.view'), 'edit');
                });
            },

            deleteService: function (req, popin, user_id) {
                var user = new User(),
                    self = this,
                    View = req('user/views/user/delete.view'),
                    view;

                this.repository.find(user_id).done(function (user_values) {
                    user.populate(user_values);

                    view = new View({popin: popin, user: user});
                    view.display().then(
                        function () {
                            self.repository.delete(user_id).done(function () {
                                self.indexService(require, popin);
                                Notify.success(trans('User') + ' ' + user.login() + ' ' + trans('has been deleted.'));
                            });
                            view.destruct();
                        },
                        function () {
                            view.destruct();
                        }
                    );
                });
            },

            addGroupService: function (popin, user_id, group_id) {
                var user = new User(),
                    self = this;

                self.repository.find(user_id).then(
                    function (user_values) {
                        var already_grouped = false;

                        user_values.groups.forEach(function (group) {
                            if (parseInt(group_id, 10) === group.id) {
                                already_grouped = true;
                            }
                        });

                        if (!already_grouped) {
                            user_values.groups[group_id] = 'added';

                            user.populate({
                                id: user_id,
                                groups: user_values.groups
                            });

                            self.repository.save(user.getObject()).then(
                                function () {
                                    Core.ApplicationManager.invokeService('user.group.index', popin);
                                    Core.ApplicationManager.invokeService('user.user.index', popin);
                                    Notify.success(trans('User update success.'));
                                },
                                function () {
                                    Notify.error(trans('User update fail.'));
                                }
                            );
                        } else {
                            Notify.warning(trans('User is already in this group.'));
                        }
                    },
                    function () {
                        self.indexService(require, popin);
                        Notify.error(trans('User not found.'));
                    }
                );
            },

            showCurrentService: function (req) {
                var View = req('user/views/user/toolbar'),
                    view;
                this.repository.find('current').then(
                    function (user_values) {
                        view = new View({el: jQuery('#bb5-navbar-secondary > div'), user: user_values});
                        view.render();
                    },
                    function () {
                        Notify.error('Error.');
                    }
                );
            },

            changePasswordService: function (req, user, error) {
                var self = this,
                    View = req('user/views/user/current.form.view'),
                    view = new View({user: user, errors: error}, 'password');

                view.display().then(function (patch) {
                    patch.id = user.id();

                    self.repository.save(patch).then(
                        function () {
                            view.destroy();
                            Notify.success('Password updated.');
                        },
                        function (error) {
                            view.destroy();
                            self.editCurrentService(user, self.parseRestError(error));
                        }
                    );
                });
            },

            editCurrentService: function (req, user, error) {
                var self = this,
                    View = req('user/views/user/current.form.view'),
                    view = new View({user: user, errors: error}, 'current');

                view.display().then(function (user) {
                    var patch = {
                        id: user.id(),
                        firstname: user.firstname(),
                        lastname: user.lastname(),
                        email: user.email()
                    };

                    self.repository.save(patch).then(
                        function () {
                            view.destroy();
                            Notify.success('Account updated.');
                        },
                        function (error) {
                            Notify.error('Error, retry later.');

                            view.destroy();
                            self.editCurrentService(user, self.parseRestError(error));
                        }
                    );
                });
            },

            updateStatusService: function (popin, user) {
                var self = this;

                self.repository.save(user).then(
                    function () {
                        Notify.success(trans('User update success.'));
                    },
                    function () {
                        Notify.error(trans('User update fail.'));
                        self.indexService(require, popin);
                    }
                );
            },

            logoutService: function (req) {
                var DriverHandler = req('tb.core.DriverHandler');
                DriverHandler.addDriver('rest', req('tb.core.RestDriver'));
                DriverHandler.delete('security/session').then(
                    function () {
                        req('component!session').destroy();
                        document.cookie = 'PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                        document.location.reload();
                    }
                );
            }
        });
    }
);