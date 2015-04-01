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
define('tb.core.Exception', ['tb.core.Api', 'jsclass'], function () {
    'use strict';

    /**
     * Exception is the base class for all BackBee toolbar exceptions
     */
    var Exception = new JS.Class({

            api: require('tb.core.Api'),

            /**
             * Construct the exception
             */
            initialize: function (name, message, code, params) {
                this.name = name;
                this.message = message;
                this.code = code;
                this.params = params;
                this.stack = this.getStack();
            },

            /**
             * Gets the stack trace
             * @returns {array}
             */
            getStack: function () {
                var err = new Error(this.name),
                    cleanStack = [],
                    stack,
                    key;

                if (err.stack) {
                    stack = err.stack.split("\n");
                    cleanStack = stack.slice(5);

                    for (key in cleanStack) {
                        if (cleanStack.hasOwnProperty(key)) {
                            cleanStack[key] = this.parseStackLine(cleanStack[key]);
                        }
                    }
                }

                return cleanStack;
            },


            /**
             * Function to stock the Exception in Api.get('errors') and Api.get('lastError')
             * @param {Exception} error
             */
            pushError: function (error, api) {
                if (undefined === api.get('errors')) {
                    api.set('errors', []);
                }

                api.get('errors').push(error);
                api.set('lastError', error);
            },

            /**
             * Function to parse a stak trace line
             * @param {string} line  Should be something like <call>@<file>:<lineNumber>
             * @returns {object}
             */
            parseStackLine: function (stackline) {
                var regex = /^\s*at\s+([\w\W]+)\(([\w\W]+\.js)[\w\W]*:(\d+):(\d+)\)/i,
                    values = regex.exec(stackline),
                    call = ((values && values[1]) ? values[1] : stackline),
                    file = ((values && values[2]) ? values[2] : null),
                    line = ((values && values[3]) ? values[3] : null),
                    column = ((values && values[4]) ? values[4] : null);

                return {
                    column: column,
                    line: line,
                    file: file,
                    call: call
                };
            }
        }),

        throwNewException = function (name, code, message, params) {
            name = name || 'UnknowException';
            code = code || 500;
            message = message || 'No description found for this exception.';
            params = params || {};

            var expected = new Exception(name, message, code, params);
            expected.pushError(expected, expected.api);

            throw 'Error n ' + code + ' ' + name + ': ' + message;
        };

    throwNewException.silent = function (name, code, message, params) {
        try {
            throwNewException(name, code, message, params);
        } catch (e) {
            return e;
        }
    };

    require('tb.core.Api').register('exception', throwNewException);
});
