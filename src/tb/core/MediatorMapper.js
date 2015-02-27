/*
 * Copyright (c) 2011-2013 Lp digital system
 *
 * This file is part of BackBee.
 *
 * BackBee is free software: you can redistribute it and/or modify
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
define('tb.core.MediatorMapper', ['tb.core.Api'], function (Api) {
    'use strict';

    var mediatize = function (action, events, context) {
            require(['tb.core'], function (Core) {
                var name;
                for (name in events) {
                    if (events.hasOwnProperty(name)) {
                        Core.Mediator[action](name, events[name], context);
                    }
                }
            });
        },

        MediatorMapper = function (events, context) {
            this.context = context || undefined;
            this.events = events || {};
        };

    MediatorMapper.prototype.map = function () {
        mediatize('subscribe', this.events, this.context);
    };

    MediatorMapper.prototype.unmap = function () {
        mediatize('unsubscribe', this.events, this.context);
    };

    Api.register('MediatorMapper', MediatorMapper);
});
