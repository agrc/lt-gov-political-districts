(function () {
    var build = '@@dev';
    var baseUrl = './';

    if (build === 'staging') {
        baseUrl = 'https://politicaldistricts.dev.utah.gov/';
    } else if (build === 'prod') {
        baseUrl = 'https://politicaldistricts.ugrc.utah.gov/';
    }

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
