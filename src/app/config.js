define([
    'dojo/has',
    'dojo/request/xhr',

    'esri/config'
], function (
    has,
    xhr,

    esriConfig
) {
    var server;
    var apiKey;
    var quadWord;
    if (has('agrc-build') === 'prod') {
        server = 'https://mapserv.utah.gov';

        // for *.utah.gov (needs to match elections.utah.gov & politicaldistricts.ugrc.utah.gov)
        apiKey = 'AGRC-D3CDE591211690';
        quadWord = 'andrea-permit-weekend-cable';
    } else if (has('agrc-build') === 'stage') {
        server = 'https://mapserv.utah.gov';

        // for *.dev.utah.gov
        apiKey = 'AGRC-FE1B257E901672';
        quadWord = 'wedding-tactic-enrico-yes';
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
        // server = 'http://localhost';
        server = 'https://mapserv.utah.gov';
    }
    var baseUrl = '/arcgis/rest/services/LtGovPoliticalDistricts/';

    var config = {
        urls: {
            printProxy: 'https://print.agrc.utah.gov/19/arcgis/rest/services/GPServer/export',
            districts: server + baseUrl + 'Districts/MapServer',
            labels: server + baseUrl + 'Labels/MapServer'
        },
        apiKey: apiKey,
        quadWord: quadWord
    };

    esriConfig.defaults.io.corsEnabledServers.push(server);
    esriConfig.defaults.io.corsEnabledServers.push('discover.agrc.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('api.mapserv.utah.gov');

    return config;
});
