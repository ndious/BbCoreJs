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

    var MediatorMapper = function (mapping) {
    	var context = mapping.context || undefined,
    		name;

    	require(['tb.core'], function (Core) {
    		for (name in mapping.events) {
	    		if (mapping.events.hasOwnProperty(name)) {
	    			Core.Mediator.subscribe(name, mapping.events[name], context);
	    		}
	    	}
    	});
    };
    
    Api.register('MediatorMapper', MediatorMapper);
});

