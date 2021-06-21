(function () {
    // dev
    // var baseUrl = 'https://politicaldistricts.dev.utah.gov/';

    // prod
    // var baseUrl = 'https://politicaldistricts.ugrc.utah.gov/';

    // same host, use relative
    var baseUrl = './';

    var head = document.getElementsByTagName('head').item(0);

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = baseUrl + 'app/css/App.css';
    head.appendChild(link);

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = baseUrl + 'dojo/dojo.js';
    script.setAttribute('data-dojo-config', 'deps: ["app/run"]');
    head.appendChild(script);
}());
