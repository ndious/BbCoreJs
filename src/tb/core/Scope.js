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
/**
 * @category    Core
 * @package     Scope
 * @copyright   Lp digital system
 * @author      n.dufreche <nicolas.dufreche@lp-digital.fr>
 */
define('tb.core.Scope', ['tb.core.Api', 'underscore'], function (Api, Under) {
    'use strict';

    var Scope = function scope() {
            this.scopes = [];
            Api.Mediator.subscribeOnce('on:application:ready', function () {
                Api.Mediator.persistentPublish('scope:global:opening');
            });
        },

        /**
         * Open and  close scope
         * @param  {Array} scopes
         * @param  {boolean} opening
         * @return {false}
         */
        toggle = function scopesToggle(scopes, opening) {
            var i;
            for (i = 0; i < scopes.length; i = i + 1) {
                if (opening === true) {
                    Api.Mediator.publish('scope:' + scopes[i].toLowerCase() + ':opening');
                } else {
                    Api.Mediator.publish('scope:' + scopes[i].toLowerCase() + ':closing');
                }
            }
        },

        checkScope = function scopeCheck(scopes) {
            var i;
            for (i = 0; i < scopes.length; i = i + 1) {
                if ('string' !== typeof scopes[i]) {
                    Api.exception('ScopeException', 12101, 'All scope have to be a string.');
                }
            }
        };

    /**
     * Register new scope and close actually scopes open
     * @return {false}
     */
    Scope.prototype.register = function scopeRegister() {
        var openingScopes = Under.difference(arguments, this.scopes),
            closingScopes = Under.difference(this.scopes, arguments);

        checkScope(arguments);

        toggle(closingScopes, false);
        toggle(openingScopes, true);

        this.scopes = Under.difference(this.scopes, closingScopes);
        this.scopes = Under.union(this.scopes, openingScopes);
    };

    /**
     * Open a scope
     * @param  {String} scope
     * @return {false}
     */
    Scope.prototype.open = function scopeOpen(scope) {
        var index = Under.indexOf(this.scopes, scope);

        checkScope([scope]);

        if (-1 === index) {
            toggle([scope], true);
            this.scopes.push(scope);
        }
    };

    /**
     * Close a scope
     * @param  {String} scope
     * @return {false}
     */
    Scope.prototype.close = function scopeClose(scope) {
        var index = Under.indexOf(this.scopes, scope);

        checkScope([scope]);

        if (-1 !== index) {
            toggle([scope], false);
            this.scopes = Under.without(this.scopes, scope);
        }
    };

    /**
     * Subscribe to scope
     * @param  {String} scope
     * @param  {Function} openingCallback
     * @param  {Function} closingCallback
     * @return {false}
     */
    Scope.prototype.subscribe = function scopeSuscribe(scope, openingCallback, closingCallback) {
        var index = Under.indexOf(this.scopes, scope.toLowerCase());

        if ('string' !== typeof scope || 'function' !== typeof openingCallback || 'function' !== typeof closingCallback) {
            Api.exception('ScopeException', 12102, 'Scope subscription was incorrect.');
        }

        if (-1 !== index) {
            try {
                openingCallback.apply(undefined);
            } catch (e) {
                Api.exception.silent('ScopeException', 12103, 'Error while running Opening callback in scope "' + scope + '"" with message: ' + e);
            }
        }

        Api.Mediator.subscribe('scope:' + scope.toLowerCase() + ':opening', openingCallback);
        Api.Mediator.subscribe('scope:' + scope.toLowerCase() + ':closing', closingCallback);
    };

    Api.register('Scope', new Scope());
});
