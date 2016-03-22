define([
    'dojo/has'
], function (
    has
) {
    var server;
    var apiKey;
    if (has('agrc-build') === 'prod') {
        server = 'http://mapserv.utah.gov';
        apiKey = 'AGRC-81AF0E22246112';
    } else {
        server = 'http://localhost';
        apiKey = 'AGRC-63E1FF17767822';
    }
    var baseUrl = '/arcgis/rest/services/LtGovPoliticalDistricts/';

    var config = {
        urls: {
            print: server + baseUrl + 'ExportWebMap/GPServer/Export%20Web%20Map',
            districts: server + baseUrl + 'Districts/MapServer',
            labels: server + baseUrl + 'Labels/MapServer'
        },
        apiKey: apiKey
    };

    return config;
});
