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
            'jquery',
            'put-selector',
            'sherlock',
            'spinjs',
            'xstyle',
            {
                name: 'spin',
                location: 'spinjs',
                main: 'spin'
            }
        ]
    }, [
        'jquery/dist/jquery',
        'app/App',
        'dojo/domReady!'
    ], function (
        $,
        App
    ) {
        window.mapapp = new App({}, 'agrc-map');
    });
}());
