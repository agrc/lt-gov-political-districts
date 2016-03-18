/*global dojo, console, esri, alert, ltgov*/
/*jslint sub:true*/
dojo.provide("ltgov.Identify");

// moved these to agrc_map.js
// dojo['require']("esri.dijit.Popup");
// dojo['require']('esri.tasks.identify');
dojo.require("ltgov.PopupContent");

ltgov.Identify = function(app) {
	// summary:
	//		Handles clicking on the map and showing an info window with the districts
	console.info("Identify:constructor", arguments);

	// properties

	// app: mapApp
	this.app = app;

	// popup: esri.dijits.Popup
	this.popup = null;

	// task: esri.tasks.IdentifyTask
	this.task = null;

	// iParams: esri.tasks.IdentifyParams
	this.iParams = null;

	// screenPoint: esri.geometry.Point
	//		Used to position the popup
	this.screenPoint = null;

	// pContent: ltgov.pContent
	//		The widget that displays the contents of the popup
	this.pContent = null;

	// symbol: esri.symbol.SimpleFillSymbol
	//		The symbol used to display the districts
	this.symbol = esri.symbol.SimpleFillSymbol();

	// marker: esri.symbol.SimpleMarkerSymbol
	//		The symbol used to mark the identify location
	this.marker = new esri.symbol.SimpleMarkerSymbol().setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND).setColor(new dojo.Color([255, 0, 0, 0.5]));

	this.initPopup();

	this.initIdentifyTask();
};

ltgov.Identify.prototype.initPopup = function() {
	// summary:
	//		sets up the popup
	console.info("Identify:initPopup", arguments);
	
	console.log("here");
	this.popup = new esri.dijit.Popup({}, dojo.create('div'));
	console.log("after");
	this.popup.resize(295, 143);
	this.popup.setTitle("Map Point Areas");

	this.pContent = new ltgov.PopupContent({app: this.app}, dojo.create('div'));

	this.popup.setContent(this.pContent.domNode);
};

ltgov.Identify.prototype.initIdentifyTask = function() {
	// summary:
	//		sets up the identify task
	console.info("Identify:initIdentifyTask", arguments);

	this.task = new esri.tasks.IdentifyTask(this.app.districtsServiceUrl);

	this.iParams = new esri.tasks.IdentifyParameters();
	this.iParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
	this.iParams.returnGeometry = true;
	this.iParams.tolerance = 1;
};

ltgov.Identify.prototype.wireEvents = function() {
	// summary:
	//		wires all of the events
	console.info("Identify:wireEvents", arguments);

	dojo.connect(this.app.map, "onClick", this, 'onMapClick');
	dojo.connect(this.task, "onComplete", this, 'onTaskComplete');
	dojo.connect(this.task, "onError", this, 'onTaskError');
	dojo.connect(this.popup, "onHide", this, function(){
		this.app.map.graphics.clear();
	});
	dojo.connect(this.app.map, "onLoad", this, function(){
		this.app.map.graphics.disableMouseEvents();
	});
};

ltgov.Identify.prototype.onMapClick = function(evt) {
	// summary:
	//		Fires when the user clicks on the map
	// evt: esri.Map:onClick event object
	console.info("Identify:onMapClick", arguments);

	this.identifyPoint(evt.mapPoint);

	var g = new esri.Graphic(evt.mapPoint, this.marker, {}, {});
	this.app.map.graphics.add(g);
};

ltgov.Identify.prototype.identifyPoint = function(pnt) {
	// summary:
	//		Identifies the pnt
	// pnt: esri.geometry.Point
	console.info("Identify:identifyPoint", arguments);

	this.app.map.showLoader();

	this.popup.hide();

	this.app.map.graphics.clear();

	var that = this;
	function maxOffset() {
		var pixelTolerance = 0.5;
		return Math.floor(that.app.map.extent.getWidth() / that.app.map.width) * pixelTolerance;
	}

	this.iParams.maxAllowableOffset = maxOffset();
	this.iParams.geometry = pnt;
	this.iParams.height = this.app.map.height;
	this.iParams.mapExtent = this.app.map.extent;
	this.iParams.width = this.app.map.width;

	this.task.execute(this.iParams);

	this.screenPoint = this.app.map.toScreen(pnt);
};

ltgov.Identify.prototype.onTaskComplete = function(iResults) {
	// summary:
	//		callback from identify task
	// iResults: IdentifyResult[]
	console.info("Identify:onTaskComplete", arguments);

	if (iResults.length === 0){
		alert("There were no districts found for this location.");
	} else {
		this.getContent(iResults);

		this.loadGraphics(iResults);
	
		this.popup.show(this.screenPoint);
	}

	this.app.map.hideLoader();
};

ltgov.Identify.prototype.getContent = function(iResults) {
	// summary:
	//		generates the content for the popup box
	console.info("Identify:getContent", arguments);

	function getValue(result, fieldName) {
		var value = result.feature.attributes[fieldName];
		return value || "";
	}

	dojo.forEach(iResults, function(result) {
		switch(result.layerName) {
			case this.Congress:
				this.pContent.set('congress', getValue(result, this.fieldNames.Congress.DISTRICT));
				break;
			case this.Senate:
				this.pContent.set('senate', getValue(result, this.fieldNames.Senate.DIST));
				break;
			case this.House:
				this.pContent.set('house', getValue(result, this.fieldNames.House.DIST));
				break;
			case this.School:
				this.pContent.set('school', getValue(result, this.fieldNames.School.DIST));
				break;
			// case this.Precinct:
				// if (this.app.showPrecincts) {
					// this.pContent.set('precinct', getValue(result, this.fieldNames.Precinct.VistaID));
				// } else {
					// this.pContent.set('precinct', '(Available Feb 2012)');
				// }
				// break;
		}
	}, this);
	this.pContent.set('precinct', '(Available Feb 2012)');
};

ltgov.Identify.prototype.loadGraphics = function(iResults) {
	// summary:
	//		loads the identify graphics into the map's graphics layer
	console.info("Identify:loadGraphics", arguments);

	dojo.forEach(iResults, function(result) {
		var g = result.feature;
		g.setSymbol(this.symbol);
		g.hide();
		this.app.map.graphics.add(result.feature);
		switch(result.layerName) {
			case this.Congress:
				this.pContent.set('congressGraphic', g);
				break;
			case this.Senate:
				this.pContent.set('senateGraphic', g);
				break;
			case this.House:
				this.pContent.set('houseGraphic', g);
				break;
			case this.School:
				this.pContent.set('schoolGraphic', g);
				break;
			case this.Precinct:
				if (this.app.showPrecincts) {
					this.pContent.set('precinctGraphic', g);
				} else {
					this.pContent.set('precinctGraphic', null);
				}
				break;
		}
	}, this);
};

ltgov.Identify.prototype.onTaskError = function(e) {
	// summary:
	//		fires when the task returns an error
	console.info("Identify:onTaskError", arguments);

	alert("There was an error returned from the identify query.");
	console.error(e);

	this.app.map.hideLoader();
};

// constants
ltgov.Identify.prototype.Congress = "Congress";
ltgov.Identify.prototype.Senate = "State Senate";
ltgov.Identify.prototype.House = "State House";
ltgov.Identify.prototype.School = "State School Board";
ltgov.Identify.prototype.Precinct = "Precincts";

// field names
ltgov.Identify.prototype.fieldNames = {
	Congress: {
		DISTRICT: "DISTRICT"
	},
	Senate: {
		DIST: "DIST"
	},
	House: {
		DIST: "DIST"
	},
	School: {
		DIST: "DIST"
	},
	Precinct: {
		VistaID: "VistaID"
	}
};
