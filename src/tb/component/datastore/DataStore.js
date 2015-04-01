define(['require', 'jquery', 'BackBone', 'tb.core.Api', 'underscore', 'jsclass', 'tb.core.DriverHandler', 'tb.core.RestDriver'], function (require, jQuery, BackBone, Api, underscore) {
    'use strict';
    var CoreDriverHandler = require('tb.core.DriverHandler'),
        CoreRestDriver = require('tb.core.RestDriver'),
        AbstractDataStore = new JS.Class({
            defaultConfig: {
                idKey: 'uid'
            },

            initialize: function (config) {
                jQuery.extend(this, {}, BackBone.Events);
                this.config = jQuery.extend({}, this.defaultConfig, config);
                this.filters = {};
                this.sorters = {};
                this.start = 0;
                this.limit = 25;
                this.data = [];
                this.notifyChange = true;
                this.tasksQueue = [];
            },

            addFilter: function (name, def) {
                if (!name || typeof name !== "string") {
                    Api.exception('DataStoreException', 74000, '[addFilter] filter name should be a string');
                }
                if (!def || typeof def !== 'function') {
                    Api.exception('DataStoreException', 74001, '[addFilter] def should be a function');
                }
                this.filters[name] = def;
            },

            addSorter: function (name, def) {
                if (!name || typeof name !== "string") {
                    Api.exception('DataStoreException', 74000, '[addSorter] sorter name should be a string');
                }
                if (!def || typeof def !== 'function') {
                    Api.exception('DataStoreException', 74001, '[addSorter] def should be a function');
                }
                this.sorters[name] = def;
            },

            setStart: function (start) {
                this.start = start;
                return this;
            },

            setLimit: function (limit) {
                this.limit = limit;
                return this;
            },

            triggerProcessing: function () {
                this.trigger("processing");
            },

            getActionInfos: function (name) {
                var actionInfos = name.split(":");
                return this[actionInfos[0]][actionInfos[1]];
            },

            processTasks: function () {
                Api.exception.silent('DataStoreException', 74005, 'You must implement processTasks');
            },

            applyFilter: function (name) {
                var task = {
                    name: 'filters:' + name,
                    params: []
                },
                    params = jQuery.merge([], arguments);
                params.shift();
                task.params = params;
                this.tasksQueue.push(task);
                return this;
            },

            applySorter: function (name) {
                var orderTask = {
                    name: 'sorters:' + name,
                    params: []
                },
                    params = jQuery.merge([], arguments);
                params.shift();
                orderTask.params = params;
                this.tasksQueue.push(orderTask);
                return this;
            },

            processData: function (data) {
                return data;
            },

            unApplyFilter: function (filterName) {
                this.tasksQueue = underscore.reject(this.tasksQueue, function (task) {
                    return task.name === "filters:" + filterName;
                });
                return this;
            },
            unApplySorter: function (sorterName) {
                this.tasksQueue = underscore.reject(this.tasksQueue, function (task) {
                    return task.name === "sorters:" + sorterName;
                });
                return this;
            },

            clear: function () {
                this.tasksQueue = [];
                this.start = 0;
                this.limit = 25;
            },

            load: function () {
                return;
            },

            setData: function (data) {
                this.data = this.processData(data);
                if (this.notifyChange) {
                    this.trigger("dataStateUpdate", this.data);
                }
                this.trigger("doneProcessing");
            },

            execute: function (silent) {
                this.notifyChange = (typeof silent === "boolean") ? silent : true;
                this.trigger("processing");
                return this.processTasks();
            }
        }),
        /* JSON Adapter */
        JsonDataStore = new JS.Class(AbstractDataStore, {
            initialize: function (config) {
                this.callSuper(config);
                var data = (this.config.hasOwnProperty('data')) ? this.config.data : [];
                this.dataList = new Api.SmartList({
                    idKey: this.config.idKey,
                    data: data
                });
                this.createGenericSorter();
                this.previousDataState = {};
            },

            createGenericSorter: function () {
                this.addSorter("fieldSorter", function (fieldName, direction, data) {
                    if (!direction && typeof direction !== "string") {
                        throw "a Sort direction must be provided";
                    }
                    if (direction === "desc") {
                        data.sort(function (a, b) {
                            if (a.hasOwnProperty(fieldName) && b.hasOwnProperty(fieldName)) {
                                var result = a[fieldName] < b[fieldName];
                                return result;
                            }
                        });
                    }
                    if (direction === "asc") {
                        data.sort(function (a, b) {
                            if (a.hasOwnProperty(fieldName) && b.hasOwnProperty(fieldName)) {
                                var result = a[fieldName] > b[fieldName];
                                return result;
                            }
                        });
                    }
                    return data;
                });
            },

            processTasks: function () {
                var self = this,
                    dataState = this.dataList.toArray(true);
                jQuery.each(this.tasksQueue, function (i, task) {
                    try {
                        var taskAction = self.getActionInfos(task.name);
                        if (!taskAction) {
                            throw "processTasks:taskFunc for task " + task.name;
                        }
                        task.params.push(dataState);
                        dataState = taskAction.apply({}, task.params, i);
                    } catch (e) {
                        Api.exception.silent('DataStoreException', 74001, '[processTasks] ' + e);
                    }
                });
                /* notify the new state */
                this.setData(dataState);
            }
        }),
        /* RestDataAdapter */
        RestDataStore = new JS.Class(AbstractDataStore, {
            defaultConfig: {
                autoLoad: false,
                idKey: 'uid'
            },
            getTotal: function () {
                return this.total;
            },

            initialize: function (config) {
                config = jQuery.extend({}, this.defaultConfig, config);
                this.callSuper(config);
                this.notifyChange = true;
                this.initRestHandler();
                this.total = 0;
                this.createGenericFilter();
                if (this.config.autoLoad) {
                    this.load();
                }
            },

            createGenericFilter: function () {
                return;
            },

            initRestHandler: function () {
                CoreDriverHandler.addDriver('rest', CoreRestDriver);
                this.restHandler = CoreDriverHandler.addDriver('rest', CoreRestDriver);
            },

            /* build resquest here */
            processTasks: function () {
                var self = this,
                    restParams = {
                        limit: this.limit,
                        sorters: {},
                        start: this.start,
                        criterias: {}
                    },
                    resultPromise = new jQuery.Deferred();
                restParams.limit = this.limit;
                jQuery.each(this.tasksQueue, function (i, task) {
                    try {
                        var taskAction = self.getActionInfos(task.name);
                        task.params.push(restParams);
                        restParams = taskAction.apply({}, task.params, i);
                    } catch (e) {
                        self.trigger('dataStoreError', e);
                        return true; //continue
                    }
                });
                CoreDriverHandler.read(this.config.resourceEndpoint, restParams.criterias, restParams.sorters, this.start, this.limit).done(function (data, response) {
                    self.total = response.getRangeTotal();
                    self.setData(data);
                    resultPromise.resolve(data);
                }).fail(function (response) {
                    self.trigger('doneProcessing');
                    self.trigger('dataStoreError', response);
                    resultPromise.reject(response);
                });
                return resultPromise;
            },

            count: function () {
                return this.data.length;
            },

            save: function (itemData) {
                var self = this,
                    dfd = new jQuery.Deferred();
                self.trigger("processing");
                if (itemData.hasOwnProperty(this.config.idKey) && itemData[this.config.idKey]) {
                    CoreDriverHandler.update(this.config.resourceEndpoint, itemData, {
                        'id': itemData[this.config.idKey]
                    }).done(function (response, headers) {
                        self.trigger('change', 'update', itemData);
                        self.trigger("doneProcessing");
                        dfd.resolve(itemData, response, headers);
                    }).fail(function (reason) {
                        self.trigger("doneProcessing");
                        dfd.reject(reason);
                    });
                } else {
                    CoreDriverHandler.create(this.config.resourceEndpoint, itemData).done(function (response, headers) {
                        itemData.uid = headers.getHeader('BB-RESOURCE-UID');
                        self.trigger('change', 'create', itemData);
                        self.trigger("doneProcessing");
                        dfd.resolve(itemData, response, headers);
                    }).fail(function (reason) {
                        self.trigger("doneProcessing");
                        dfd.reject(reason);
                    });
                }
                return dfd.promise();
            },

            computeNextStart: function (page) {
                this.setStart((page - 1) * this.limit);
            },

            remove: function (itemData) {
                this.trigger("processing");
                var self = this,
                    dfd = new jQuery.Deferred(),
                    uid = itemData.hasOwnProperty(this.config.idKey) ? itemData[this.config.idKey] : null,
                    /* compute new start */
                    nextTotal = self.total - 1,
                    nbPage = Math.ceil(nextTotal / self.limit),
                    nextStart = (nbPage >= this.start + 1) ? this.start : this.start - 1;
                nextStart = (nextStart < 0) ? nextStart : 0;
                if (!uid) {
                    Api.exception('DataStoreException', 75001, '[remove] ' + this.idKey + ' key can\'t be found');
                }
                CoreDriverHandler["delete"](this.config.resourceEndpoint, {
                    uid: itemData[this.config.idKey]
                }).done(function () {
                    dfd.resolve(itemData);
                    self.setStart(nextStart);
                    self.trigger("dataDelete", itemData);
                    self.trigger("doneProcessing");
                }).fail(function (reason) {
                    dfd.reject(reason);
                    self.trigger("error", {
                        method: "remove"
                    });
                    self.trigger("doneProcessing");
                });
                return dfd.promise();
            }
        });
    return {
        JsonDataStore: JsonDataStore,
        RestDataStore: RestDataStore
    };
});