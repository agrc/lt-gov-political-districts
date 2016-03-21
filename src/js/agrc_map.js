(function() {
	var head = document.getElementsByTagName("head").item(0);

	function loadCss(href) {
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = href;
		head.appendChild(link);
	}

	function loadJavaScript(src) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = src;
		head.appendChild(script);
	}

	function init() {
		loadJavaScript('app/run.js');
	}

	loadCss('app/css/App.css');

	window.dojoConfig = {
		addOnLoad: init
	};
	loadJavaScript('dojo/dojo.js');
})();
