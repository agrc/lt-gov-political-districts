(function () {
    require({
        baseUrl: './',
        packages: [
            'agrc',
            'app',
            'bootstrap',
            'dgrid',
            'dijit',
            'dojo',
            'dojox',
            'esri',
            'put-selector',
            'sherlock',
            'xstyle',
            {
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            }
        ],
        map: {
            sherlock: {
                'spinjs/spin': 'spin'
            }
        }
    }, [
        'app/App',
        'dojo/domReady!'
    ], function (App) {
        window.mapapp = new App({}, 'agrc-map');
    });
}());
