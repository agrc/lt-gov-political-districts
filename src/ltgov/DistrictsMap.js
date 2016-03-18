/*global dojo, console, dijit, ltgov, agrc, esri, window, document, dojox, alert*/

// provide namespace
dojo.provide("ltgov.DistrictsMap");

// stuff that esri requests that I'd like to just package into my layer file
dojo.require("dojox.charting.Chart");
dojo.require("dojox.charting.Chart2D");
dojo.require("dojox.charting.themes.PlotKit.base");
dojo.require("dojox.charting.action2d.Base");
dojo.require("dijit.Tooltip");
dojo.require("dojox.lang.functional.scan");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("agrc.widgets.map.BaseMap");
dojo.require("agrc.widgets.map.BaseMapSelector");
dojo.require("agrc.widgets.layer.OpacitySlider");
dojo.require("ltgov.LayerVisibilities");
dojo.require("ltgov.FindLocation");
dojo.require("ltgov.Identify");
dojo.require("bootstrap.bootstrap-twipsy");
dojo.require("dijit.Dialog");
dojo.require("dojox.fx.scroll");
dojo.require("ltgov.PrintMap");


dojo.declare("ltgov.DistrictsMap", [dijit._Widget, dijit._Templated], {
	// summary:
	//		The app object in charge of the app as a whole

	// showPrecincts: Boolean
	//		switch to turn on or off precincts
	showPrecincts: false,

	// map: agrc.widgets.map.BaseMap
	map: null,

	// server: String
	server: "http://mapserv.utah.gov",
	// server: 'http://localhost',

	// districtsServiceUrl: String
	districtsServiceUrl: '',

	// districtsCachedServiceUrl: String
	districtsCachedServiceUrl: '',

	// precinctsBlocksServiceUrl: String
	precinctsBlocksServiceUrl: '',

	// labelsServiceUrl: String
	labelsServiceUrl: '',

	// districtsLayer: esri.layers.ArcGISDynamicMapServiceLayer
	districtsLayer: null,

	// districtsCachedLayer: esri.layers.ArcGISTiledMapServiceLayer
	//		This is the initial layer shown and then turned off after extent change
	//		Hopefully this will help save load on our servers.
	districtsCachedLayer: null,

	// othersLayer: esri.layers.ArcGISDynamicMapServiceLayer
	othersLayer: null,

	// labelsLayer: esri.layers.ArcGISDynamicMapServiceLayer
	labelsLayer: null,

	// identify: ltgov.Identify
	identify: null,

	// othersSlider: agrc.layer.OpacitySlider
	othersSlider: null,

	// widgetsInTemplate: [private] Boolean
	//      Specific to dijit._Templated.
	widgetsInTemplate: true,

	// templatePath: [private] String
	//      Path to template. See dijit._Templated
	templatePath: dojo.moduleUrl("ltgov", "templates/DistrictsMap.html"),

	// baseClass: String
	baseClass: 'districts-map',

	// printMap: ltgov.PrintMap
	printMap: null,

	// baseMapSelector: agrc.widgets.map.BaseMapSelector
	baseMapSelector: null,

	// Parameters to constructor

	constructor: function(params, div) {
		// summary:
		//    Constructor method
		// params: Object
		//    Parameters to pass into the widget. Required values include:
		// div: String|DomNode
		//    A reference to the div that you want the widget to be created in.
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.districtsServiceUrl = this.server + "/ArcGIS/rest/services/LtGovVotingDistricts/Districts/MapServer";
		this.districtsCachedServiceUrl = this.server + "/ArcGIS/rest/services/LtGovVotingDistricts/DistrictsCached/MapServer";
		this.precinctsBlocksServiceUrl = this.server + "/ArcGIS/rest/services/LtGovVotingDistricts/Others/MapServer";
		this.labelsServiceUrl = this.server + "/ArcGIS/rest/services/LtGovVotingDistricts/Labels/MapServer";
	},
	postCreate: function() {
		// summary:
		//    Overrides method of same name in dijit._Widget.
		// tags:
		//    private
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.initMap();

		this.initSliders();

		var layerVisibilities = new ltgov.LayerVisibilities(this);

		this.initFindLocation();

		this.wireEvents();

		var msg;
		if (!this.showPrecincts) {
			msg = " (Available Feb 2012)";
		} else {
			msg = " (Zoom in to see)";
		}
		dojo.byId('precincts-msg').innerHTML = msg;
	},
	wireEvents: function() {
		// summary:
		//      wires all of the events
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		var that = this;
		dojo.query('.pdf-link-small').onclick(function (evt) {
			that.onPDFLinkClick(evt, that.pdfDialogSmall, that.smallDialogSizer);
		});
		dojo.query('.pdf-link-large').onclick(function (evt) {
			that.onPDFLinkClick(evt, that.pdfDialogLarge, that.largeDialogSizer);
		});

		this.connect(this.printBtn, "onClick", this.onPrintBtnClick);
		this.connect(this.moreInfoLink, 'onclick', this.onMoreInfoClick);
		this.connect(this.moreInfoOk, 'onClick', this.onMoreInfoOkClick);
	},
	initMap: function() {
		// summary:
		//      sets up the map
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.identify = new ltgov.Identify(this);

		var mapOptions = {
			useDefaultBaseMap: false,
			includeFullExtentButton: true,
			infoWindow: this.identify.popup
		};

		this.map = new agrc.widgets.map.BaseMap('map-div', mapOptions);

		this.map.showLoader();

		this.identify.wireEvents();

		var selectorOptions = {
			map: this.map,
			id: "claro"
		};
		this.baseMapSelector = new agrc.widgets.map.BaseMapSelector(selectorOptions);

		var that = this;
		dojo.connect(this.map, "onLoad", function() {
			that.map.disableScrollWheelZoom();
		});

		this.districtsLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this.districtsServiceUrl, {
			opacity: 0.5,
			visible: false
		});
		this.map.addLayer(this.districtsLayer);
		this.districtsCachedLayer = new esri.layers.ArcGISTiledMapServiceLayer(this.districtsCachedServiceUrl, {
			opacity: 0.5
		});
		this.map.addLayer(this.districtsCachedLayer);
		this.map.addLoaderToLayer(this.districtsLayer);
		this.othersLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this.precinctsBlocksServiceUrl, {
			visible: false
		});
		this.map.addLayer(this.othersLayer);
		this.map.addLoaderToLayer(this.othersLayer);
		this.labelsLayer = new esri.layers.ArcGISDynamicMapServiceLayer(this.labelsServiceUrl, {
			visible: true
		});
		this.map.addLayer(this.labelsLayer);
		this.map.addLoaderToLayer(this.labelsLayer);
	},
	initSliders: function() {
		// summary:
		//      Sets up the layer opacity sliders
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		var slider = new agrc.widgets.layer.OpacitySlider({
			mapServiceLayer: this.districtsLayer
		}, 'districts-slider');
		this.othersSlider = new agrc.widgets.layer.OpacitySlider({
			mapServiceLayer: this.othersLayer
		}, 'other-slider');
		this.othersSlider.slider.set('disabled', true);
	},
	initFindLocation: function() {
		// summary:
		//      Sets up the find address widget
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		// create new graphics layer to prevent conflicts
		var gLayer = new esri.layers.GraphicsLayer();
		this.map.addLayer(gLayer);

		var f = new ltgov.FindLocation({
			map: this.map,
			graphicsLayer: gLayer,
			app: this
		}, 'find-location');

		var that = this;
		dojo.connect(f, "onFind", function(result) {
			var defZoom, defPan;
			function identify() {
				dojo.disconnect(defZoom);
				dojo.disconnect(defPan);

				var pnt = new esri.geometry.Point(result.UTM_X, result.UTM_Y, that.map.spatialReference);
				that.identify.identifyPoint(pnt);
			}

			defZoom = dojo.connect(that.map, "onZoomEnd", function() {
				identify();
			});
			defPan = dojo.connect(that.map, "onPanEnd", function() {
				identify();
			});
		});
	},
	onPDFLinkClick: function(evt, dialog, sizer){
		// summary:
		//      opens the dialog and scrolls to the header
		// evt: Click event
		// dialog: dojo dialog
		// sizer: div
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		var headerID = evt.currentTarget.name;

		dojo.stopEvent(evt);

		dialog.show();

		window.setTimeout(function(){
			dojox.fx.smoothScroll({
				node: dojo.byId(headerID),
				win: sizer
			}).play();
		}, 250);
	},
	onPrintBtnClick: function(evt){
		// summary:
		//      calls the print web service
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		dojo.byId('print-results').innerHTML = "";

		if (!this.printMap){
			this.printMap = new ltgov.PrintMap({
				app: this
			});
		}

		var that = this;
		this.printMap.print().then(function(){
			that.printBtn.cancel();
		}, function(er){
			alert("There was an error printing your map!");
			that.printBtn.cancel();
		});
	},
	onMoreInfoClick: function(e){
		// summary:
		//      fires when the user clicks on the more info link in the disclaimer
		//		shows the more info dialog
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		dojo.stopEvent(e);

		this.moreInfoDialog.show();
	},
	onMoreInfoOkClick: function(e){
		// summary:
		//      fires when the user clicks the OK button on the more info dialog
		//		closes the dialog
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.moreInfoDialog.hide();
	}
});
