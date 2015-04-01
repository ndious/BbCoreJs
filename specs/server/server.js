(function () {
    'use strict';

    var http = require('http'),
        url = require('url'),
        fs = require('fs'),

        server = http.createServer(function (req, res) {
            var pageUrl = url.parse(req.url).pathname;

            fs.realpath(__dirname + '/request/' + pageUrl, function (err, resolvedPath) {
                if (null !== err) {
                    res.writeHead(404);
                    res.write('404 not found');
                    res.end();
                } else {
                    fs.readFile(resolvedPath, function (errRead, data) {
                        if (null !== errRead) {
                            res.writeHead(403);
                            res.write('403 access denied');
                            res.end();
                        } else {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.write(data);
                            res.end();
                        }
                    });
                }
            });
        });

    server.listen(8080);
}());