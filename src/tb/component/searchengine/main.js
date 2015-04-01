/*global $:false, jQuery:false */
define(['tb.core', 'require', 'jquery', 'jsclass', 'datetimepicker', 'text!../searchengine/templates/layout.tpl'], function (Core, require, corejQuery) {
    'use strict';
    if (!corejQuery.fn.hasOwnProperty("datetimepicker")) {
        if (jQuery) {
            corejQuery.fn.datetimepicker = jQuery.fn.datetimepicker;
        }
        if ($) {
            corejQuery.fn.datetimepicker = $.fn.datetimepicker;
        }
    }

    var SimpleSearchEngine = new JS.Class({
        mainSelector: Core.get('wrapper_toolbar_selector'),
        defaultConfig: {
            datepickerClass: '.show-calendar',
            datepickerFieldClass: '.bb5-datepicker',
            beforeDateClass: '.before-date',
            afterDateClass: '.after-date',
            titleFieldClass: '.content-title',
            searchBtnClass: '.search-btn'
        },

        initialize: function (config) {
            this.config = corejQuery.extend({}, this.defaultConfig, config);
            corejQuery.extend(this, {}, Backbone.Events);
            this.widget = corejQuery(require('text!../searchengine/templates/layout.tpl')).clone();
            this.initDatepicker();
            this.bindEvents();
        },

        initDatepicker: function () {
            var self = this;
            this.widget.find(this.config.datepickerFieldClass).datetimepicker({
                timepicker: false,
                closeOnDateSelect: true,
                format: "d/m/Y",
                parentID: self.mainSelector,
                onSelectDate: function (ct, field) {
                    jQuery(field).data('selectedTime', Math.ceil(ct.getTime() / 1000));
                }
            });
        },

        showOrInitDateTimePicker: function (e) {
            var dateField = jQuery(e.currentTarget).parents(".col-bb5-22").find(this.defaultConfig.datepickerFieldClass).eq(0);
            if (!jQuery(dateField).data('datetimepicker')) {
                this.initDatepicker();
            }
            jQuery(dateField).datetimepicker('show');
        },

        bindEvents: function () {
            corejQuery(this.widget).on('click', this.config.datepickerClass, corejQuery.proxy(this.showOrInitDateTimePicker, this));
            corejQuery(this.widget).on('click', this.config.searchBtnClass, corejQuery.proxy(this.handleSearch, this));
        },

        render: function (container, positionMethod) {
            positionMethod = (typeof positionMethod === "string") ? positionMethod : 'html';
            if (container && jQuery(container).length) {
                jQuery(container)[positionMethod](this.widget);
            } else {
                return this.widget;
            }
        },

        handleSearch: function () {
            var criteria = {};
            criteria.title = jQuery(this.config.titleFieldClass).eq(0).val();
            criteria.beforeDate = jQuery(this.config.beforeDateClass).eq(0).data('selectedTime') || '';
            criteria.afterDate = jQuery(this.config.afterDateClass).eq(0).data('selectedTime') || '';
            if (criteria.title.length || criteria.beforeDate.length || criteria.afterDate.length) {
                this.trigger("doSearch", criteria);
            }
        }
    });
    return {
        createSimpleSearchEngine: function (config) {
            config = config || {};
            return new SimpleSearchEngine(config);
        },
        SimpleSearchEngine: SimpleSearchEngine
    };
});