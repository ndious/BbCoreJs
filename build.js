var fs = require('fs-extra'),

    sys = require('sys'),

    exec = require('child_process').execSync,

    errorPrint = function (err, message) {
        console.log(message);
        console.error(err);
    },

    gitPublish = function () {
        var repo = exec('git config remote.origin.url').replace(/^(?:git@|https:\/\/)/, '').trim(),
            deployUrl = 'https://' + process.env.GIT_TOKEN + '@' + repo,
            deployBranch = 'composer',
            rev = exec('git rev-parse HEAD').trim();

        exec('git config user.name ' + process.env.GIT_NAME);
        exec('git config user.email ' + process.env.GIT_EMAIL);
        exec('git add --all');
        exec('git commit -m "Built from ' + rev + '"');
        exec('git push -q ' + deployUrl + ' ' + deployBranch);
    };

if (parseInt(process.env.TRAVIS_PULL_REQUEST, 10) > 0) {
    process.exit(0);
}

console.log('Stating create dist build.');

fs.mkdirs('dist', function (err) {
     if (err) {
        errorPrint(err, 'CSS dir not created');
    } else {
        fs.mkdirs('css', function (err) {
            if (err) {
                errorPrint(err, 'CSS dir not created');
            } else {
                console.log('Strat importing css');

                fs.copy('html/css', 'css/', function (err) {
                    if (err) {
                        errorPrint(err, 'Vendor dir not update from bower_components');
                    }
                });
            }
        });

        fs.mkdirs('vendor', function (err) {
            if (err) {
                errorPrint(err, 'Vendor dir not created');
            } else {
                console.log('Strat importing vendors');

                fs.copy('node_modules/jsclass', 'vendor/jsclass', function (err) {
                    if (err) {
                        errorPrint(err, 'Vendor dir not update from node_modules');
                    }
                });

                fs.copyRecursive('bower_components/', 'vendor/', function (err) {
                    if (err) {
                        errorPrint(err, 'Vendor dir not update from bower_components');
                    }
                    gitPublish();
                });
            }
        });
    }
})

