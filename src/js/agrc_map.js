(function () {
    var build = '@@dev'; // set by grunt-replace
    var base;
    var baseUrl;
    if (build === 'prod') {
        base = baseUrl = 'https://mapserv.utah.gov/LtGovVotingDistricts_Widget/';
    } else if (build === 'staging') {
        base = baseUrl = 'https://test.mapserv.utah.gov/LtGovVotingDistricts_Widget/';
    } else {
        base = '';
        baseUrl = './dojo/';
    }

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
