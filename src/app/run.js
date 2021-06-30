(function () {
    var config = {
        packages: [
            'agrc',
            'app',
            'bootstrap',
            'dgrid',
            'dgrid1',
            'dijit',
            'dojo',
            'dojox',
            'dstore',
            'esri',
            'layer-selector',
            'moment',
            'put-selector',
            'xstyle',
            {
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            }
        ]
    };
    require(config, [
        'app/App',
        'dojo/domReady!'
    ], function (App) {
        window.mapapp = new App({}, 'agrc-map');
    });
}());
