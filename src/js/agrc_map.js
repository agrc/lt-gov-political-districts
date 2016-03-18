/*global console, dojo, window, ltgov*/
var mapapp;
(function() {
	var head = document.getElementsByTagName("head").item(0);

	//load css files
	function loadCss(href) {
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = href;
		head.appendChild(link);
	}

	//load javascript files
	function loadJavaScript(src) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = src;
		head.appendChild(script);
	}
	
	function initDojo() {
		dojo.require("esri.dijit.Popup");
		dojo.require('esri.tasks.identify');
		dojo.require("ltgov.DistrictsMap");
		
		dojo.ready(function(){
			mapapp = new ltgov.DistrictsMap({}, 'agrc-map');
		});
	}

	var css = [
		'http://serverapi.arcgisonline.com/jsapi/arcgis/2.5/js/dojo/dijit/themes/claro/claro.css', 
		'http://serverapi.arcgisonline.com/jsapi/arcgis/2.5/js/esri/dijit/css/Popup.css', 
		'http://ajax.googleapis.com/ajax/libs/dojo/1.6.1/dojox/form/resources/BusyButton.css', 
		'css/agrc_map.css'
		];
	for(var i = 0; i < css.length; i++) {
		loadCss(css[i]);
	}

	window.djConfig = {
		isDebug: true,
		debugAtAllCosts: true,
		baseUrl: './',
		modulePaths: {
			'agrc': "./agrc",
			'ltgov': "./ltgov",
			"bootstrap": "./bootstrap"
		},
		afterOnLoad: true,
		addOnLoad: initDojo
	};
	
	loadJavaScript('http://serverapi.arcgisonline.com/jsapi/arcgis/?v=2.5');
	loadJavaScript('http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js');
})();
