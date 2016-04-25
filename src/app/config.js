define([
    'dojo/has',
    'dojo/request/xhr'
], function (
    has,
    xhr
) {
    var server;
    var apiKey;
    var quadWord;
    if (has('agrc-build') === 'prod') {
        server = 'https://mapserv.utah.gov';

        // for elections.utah.gov
        apiKey = 'AGRC-81AF0E22246112';
        quadWord = 'andrea-permit-weekend-cable';
    } else if (has('agrc-build') === 'stage') {
        // for test.mapserv.utah.gov
        quadWord = 'opera-event-little-pinball';
        apiKey = 'AGRC-AC122FA9671436';
    } else {
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            quadWord = secrets.quadWord;
            apiKey = secrets.apiKey;
        }, function () {
            throw 'Error getting secrets!';
        });
        server = 'http://localhost';
    }
    var baseUrl = '/arcgis/rest/services/LtGovPoliticalDistricts/';

    var config = {
        urls: {
            printProxy: server + '/arcgis/rest/services/PrintProxy/GPServer/PrintProxy',
            print: server + baseUrl + 'ExportWebMap/GPServer/Export%20Web%20Map',
            districts: server + baseUrl + 'Districts/MapServer',
            labels: server + baseUrl + 'Labels/MapServer'
        },
        apiKey: apiKey,
        quadWord: quadWord
    };

    return config;
});
