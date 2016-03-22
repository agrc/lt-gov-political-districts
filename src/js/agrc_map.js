(function () {
    var build = '@@build'; // set by grunt-replace
    var base;
    if (build === 'prod') {
        base = 'http://mapserv.utah.gov/LtGovVotingDistricts_Widget/';
    } else if (build === 'stage') {
        base = 'http://test.mapserv.utah.gov/LtGovVotingDistricts_Widget/';
    } else {
        base = '';
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
    script.setAttribute('data-dojo-config', 'deps: ["app/run"]');
    head.appendChild(script);
}());
