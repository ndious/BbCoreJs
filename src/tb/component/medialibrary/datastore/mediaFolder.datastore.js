define(['component!datastore', 'jquery', 'jsclass'], function (DataStore, jQuery) {
    'use strict';

    var restDataStore = new DataStore.RestDataStore({
        resourceEndpoint: 'media-folder'
    });

    restDataStore.addFilter("byMediaFolder", function (value, restParams) {
        restParams.criterias.parent_uid = value;
        return restParams;
    });

    DataStore.RestDataStore.define('moveNode', function (node, data) {
        var dfd = new jQuery.Deferred(),
            self = this;
        self.trigger("processing");
        this.restHandler.patch(this.config.resourceEndpoint, data, {
            id: node.uid
        }).done(function () {
            dfd.resolve(data);
            self.trigger('dataUpdate', data);
            self.trigger("doneProcessing");
        }).fail(dfd.reject);
        return dfd.promise();
    });

    return restDataStore;
});