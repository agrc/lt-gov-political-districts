define([
    'dojo/has'
], function (
    has
) {
    var server;
    if (has('agrc-build') === 'prod') {
        server = 'http://mapserv.utah.gov';
    } else {
        server = 'http://localhost';
    }
    var baseUrl = '/arcgis/rest/services/LtGovPoliticalDistricts/';

    var config = {
        urls: {
            print: server + baseUrl + 'ExportWebMap/GPServer/Export%20Web%20Map',
            districts: server + baseUrl + 'Districts/MapServer',
            labels: server + baseUrl + 'Labels/MapServer'
        }
    };

    return config;
});
