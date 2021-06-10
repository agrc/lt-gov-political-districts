(function () {
    // dev
    // var base = baseUrl = 'https://politicaldistricts.dev.utah.gov/';

    // prod
    // var base = baseUrl = 'https://politicaldistricts.agrc.utah.gov/';

    // same host, use relative
    var base = '';
    var baseUrl = './dojo/';

    var head = document.getElementsByTagName('head').item(0);

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = base + 'app/css/App.css';
    head.appendChild(link);

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = base + 'dojo/dojo.js';
    script.setAttribute('data-dojo-config', 'deps: ["app/run"], baseUrl: "' + baseUrl + '"');
    head.appendChild(script);
}());
