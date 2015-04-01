define(['tb.core.Api', 'component!session', 'component!authentication', 'tb.core.Request', 'tb.core.Response', 'jquery'], function (Api, session, authentication, Request, Response, jQuery) {
    'use strict';

    var request = new Request(),
        apiKey = '12345jtf6',
        apiSignature = '548zeeaT',
        fakeXhr = {
            responseText: '',
            status: '',
            getAllResponseHeaders: function () {
                return '';
            }
        };

    sessionStorage.clear();
    session.destroy();

    describe('Authentication test', function () {

        it('Testing onBeforeSend event', function () {
            session.onBeforeSend(request);
            expect(request.getHeader('X-API-KEY')).toBe(null);
            expect(request.getHeader('X-API-SIGNATURE')).toBe(null);

            sessionStorage.setItem('bb-session-auth', JSON.stringify({key: apiKey, signature: apiSignature}));
            session.load();

            session.onBeforeSend(request);
            expect(request.getHeader('X-API-KEY')).toEqual(apiKey);
            expect(request.getHeader('X-API-SIGNATURE')).toEqual(apiSignature);
        });

        it('Testing authentication function', function () {
            var username = 'foo',
                password = 'bar',
                callback = jasmine.createSpy(),
                data = {
                    username: username,
                    password: password
                };

            spyOn(jQuery, 'ajax').and.callFake(function () {
                var d = jQuery.Deferred();

                d.resolve(data, '', fakeXhr);
                expect(data).toEqual(data);

                callback();

                return d.promise();
            });

            authentication.authenticate(username, password);
            expect(callback).toHaveBeenCalled();
        });

        it('Testing persist session', function () {
            session.setKey(apiKey);
            session.setSignature(apiSignature);

            sessionStorage.clear();
            session.persist();

            expect(sessionStorage.getItem('bb-session-auth')).toEqual(JSON.stringify({key: apiKey, signature: apiSignature}));
        });

        it('Testing onRequestDone event', function () {
            var response = new Response();

            response.addHeader('X-API-KEY', apiKey);
            response.addHeader('X-API-SIGNATURE', apiSignature);

            sessionStorage.clear();

            authentication.onRequestDone(response);
            expect(sessionStorage.getItem('bb-session-auth')).toEqual(JSON.stringify({key: apiKey, signature: apiSignature}));
        });

        it('Testing onRequestFail event', function () {
            var response = new Response();

            response.setStatus(401);
            session.onRequestFail(response);
            expect(Api.get('is_connected')).toEqual(false);

            response.setStatus(403);
            session.onRequestFail(response);
        });

        it('Testing logOut function', function () {
            sessionStorage.setItem('bb-session-auth', JSON.stringify({key: apiKey, signature: apiSignature}));

            window.onbeforeunload = function () {
                return false;
            };

            session.destroy();
            expect(sessionStorage.getItem('bb-session-auth')).toEqual(null);
        });

        it('Testing onLogOut event', function () {
            sessionStorage.setItem('bb5=-session-auth', JSON.stringify({key: apiKey, signature: apiSignature}));

            window.onbeforeunload = function () {
                return false;
            };

            session.destroy();
            expect(sessionStorage.getItem('bb-session-auth')).toEqual(null);
        });
    });
});
