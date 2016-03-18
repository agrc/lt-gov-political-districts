/*global dojo, agrc, esri, console, dijit, window*/
// provide namespace
dojo.provide("agrc.widgets.map.BaseMap");

// widget requires
dojo.require('dijit.form.Button');

dojo.declare("agrc.widgets.map.BaseMap", esri.Map, {
	// description:
	//		**Summary**: Map Control with default functionality specific to State of Utah data. Extends esri.Map.
	//		<p></p>
	//		**Owner(s)**: Scott Davis
	//		<p></p>
	//		**Test Page**: <a href='/tests/dojo/agrc/1.0/agrc/widgets/tests/BaseMapTests.html' target='_blank'>
	//			agrc.widgets.map.BaseMap.Tests</a>
	//		<p></p>
	//		**Description**:
	//		<p>
	//		This widget does not inherit from dijit._Widget like most of the other agrc widgets.
	//		It inherits from an esri control, esri.Map. Please see
	//		[their documentation](http://help.arcgis.com/en/webapi/javascript/arcgis/help/jsapi/map.htm).
	//		This widget automatically adds code to handle window resizing and replaces the ESRI logo with
	//		the AGRC logo. It defaults to the State of Utah extent on load. You can easily make a
	//		loader image appear when a certain layer is drawing. See addLoaderToLayer.
	//		</p>
	//		<p>
	//		**Published Topics**:
	//		</p>
	//		<ul><li>None</li>
	//		</ul>
	//		<p>
	//		**Exceptions**:
	//		</p>
	//		<ul><li>None</li></ul>
	//		<p>
	//		**Required Files**:
	//		</p>
	//		<ul><li>None</li></ul>
	// example:
	// |	var map = new agrc.widgets.map.BaseMap('basemap-div');
	//
	// example:
	// |	var options = {
	// |		'useDefaultExtent': false,
	// |		'useDefaultBaseMap': true
	// |	};
	// |	var map = new agrc.widgets.map.BaseMap('basemap-div', options);

	// _vectorBaseMapURL: [private] String
	//		The URL to the AGRC Vector cached map service.
	_vectorBaseMapURL: 'http://mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Vector/MapServer',

	// _loader: [private] DomNode
	//		Reference to loader image
	_loader: null,

	// _layersDrawing: [private] Integer
	//		keeps track of layers that have draw - see addLoadingToLayer
	_layersDrawing: 0,

	// _defaultExtent: esri.geometry.Extent
	//		set in constructor
	_defaultExtent: null,

	// _connects: dojo.Deferred[]
	_connects: null,

	// Parameters to constructor

	// useDefaultBaseMap: Boolean
	//		If true, the map will automatically load the UtahBaseMap-Vector map service
	useDefaultBaseMap: true,

	// defaultBaseMap: String
	//		The name of the AGRC base map cache that you want to add. (ie. UtahBaseMap-Vector)
	defaultBaseMap: 'UtahBaseMap-Vector',

	// useDefaultExtent: Boolean
	//		If true, the map will automatically zoom to the state of Utah extent.
	useDefaultExtent: true,

	// includeFullExtentButton: Boolean
	//		Controls the visibility of the full extent button below the zoom slider.
	//		Defaults to false.
	includeFullExtentButton: false,

	constructor: function (mapDiv, options) {
		// summary:
		//		Constructor function for object. This overrides the esri.Map method of the same name
		// mapDiv: String or DomNode
		//		The div that you want to put the map in.
		// options: Object?
		//		The parameters that you want to pass into the widget. Includes useDefaultBaseMap,
		//		useDefaultExtent, defaultBaseMap, and includeFullExtentButton. All are optional.
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		// init properties
		this._connects = [];

		if (!options) {
			options = {};
		}

		this._defaultExtent = new esri.geometry.Extent({
			xmin: 81350,
			ymin: 3962431,
			xmax: 800096,
			ymax: 4785283,
			spatialReference: {
				wkid: 26912
			}
		});

		// set default extent
		if (!options.extent) {
			options.extent = this._defaultExtent;
			options.fitExtent = true;
		} else {
			this._defaultExtent = options.extent;
		}

		// mixin options
		dojo.mixin(this, options);

		// load basemap
		if (this.useDefaultBaseMap) {
			this.showDefaultBaseMap();
		}

		this._addResizeHandler();

		// replace default link on logo
		esri.config.defaults.map.logoLink = "http://gis.utah.gov/agrc";

		// set up loader image
		this._loader = dojo.create('span', null, mapDiv);
		dojo.addClass(this._loader, 'loadingImg');
		dojo.addClass(mapDiv, 'mapContainer');
	},
	setDefaultExtent: function () {
		// summary:
		//		Sets the extent to the State of Utah
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		this.setExtent(this._defaultExtent);
	},
	showDefaultBaseMap: function () {
		// summary:
		//		Adds the UtahBaseMap-Vector map service.
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		this.addAGRCBaseMap(this.defaultBaseMap);
	},
	_addResizeHandler: function () {
		// summary:
		//		Adds an event listener to resize and reposition the map
		//		when the window is resized.
		// tags:
		//		private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		var resizeTimer;
		this._connects.push(dojo.connect(this, 'onLoad', this, function () {
			this._connects.push(dojo.connect(window, 'resize', this, function () {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(dojo.hitch(this, function () {
					this.resize();
					this.reposition();
				}), 1500);
			}));
		}));
	},
	addLoaderToLayer: function (lyr) {
		// summary:
		//		Wires up the loader image to display when the passed layer is drawing.
		// lyr: esri.Layer
		//		The layer that you want to work with.
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		function showLoading() {
			// increment layersDrawing
			this._layersDrawing++;

			esri.show(this._loader);
		}

		function hideLoading(error) {
			// decrement layersDrawing
			this._layersDrawing--;

			// only hide loader if all layers have finished drawing
			if (this._layersDrawing <= 0) {
				esri.hide(this._loader);
			}
		}

		// wire layer events
		this._connects.push(dojo.connect(lyr, "onUpdateStart", this, showLoading));
		this._connects.push(dojo.connect(lyr, "onUpdateEnd", this, hideLoading));
	},
	showLoader: function () {
		// summary:
		//		Displays the loader icon in the bottom, left-hand corner of the map
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		esri.show(this._loader);
	},
	hideLoader: function () {
		// summary:
		//		Hides the loader icon.
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		esri.hide(this._loader);
	},
	addAGRCBaseMap: function (cacheName) {
		// summary:
		//		Add one of the AGRC basemaps to the map.
		// cacheName: String
		//		The name of the base map that you want to add. (ie. UtahBaseMap-Vector)
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		// build basemap url
		var url = 'http://mapserv.utah.gov/ArcGIS/rest/services/' + cacheName + '/MapServer';
		var lyr = new esri.layers.ArcGISTiledMapServiceLayer(url);
		this.addLayer(lyr);
	},
	_addFullExtentButton: function () {
		// summary:
		//		Adds the full extent button below the zoom slider.
		// mapDiv: String or DomNode
		//		The div that the map was created in.
		// tags:
		//		private
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		// calculate button's top and left based on zoom slider size and position
		var mapSlider = dijit.byId(this.id + '_zoom_slider');
		var left = dojo.style(mapSlider.domNode, 'left') - 7;
		var sliderTop = dojo.style(mapSlider.domNode, 'top');
		var sliderHeight = dojo.contentBox(mapSlider.domNode).h;
		var top = sliderHeight + sliderTop;

		// button container
		var container = dojo.create('div', {
			'class': 'full-extent-button-container',
			style: {
				top: top + 'px',
				left: left + 'px'
			}
		}, this.container);

		// button
		var map = this;
		// to hold reference for onClick function
		// I guess that I could have used dojo.hitch, but I just don't
		// feel like typing that again. OK! Give it a rest!
		new dijit.form.Button({
			id: this.id + '_full-extent-button',
			"class": "full-extent-button",
			iconClass: 'full-extent-button-icon',
			showLabel: false,
			type: 'button',
			onClick: function () {
				map.setDefaultExtent();
			}
		}, dojo.create('button')).placeAt(container);
	},
	onLoad: function () {
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		if (this.includeFullExtentButton) {
			// have to add timeout to allow the table to be built
			window.setTimeout(dojo.hitch(this, function () {
				this._addFullExtentButton();
			}), 1000);
		}
	},
	zoomToGeometry: function (geometry) {
		// summary:
		//		Zooms the map to any type of geometry
		// geometry: esri.Geometry
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		if (geometry.type === "polygon" || geometry.type === "polyline" || geometry.type === "multipoint") {
			this.setExtent(geometry.getExtent(), true);
		} else {
			// point
			this.centerAndZoom(geometry, 10);
		}
	},
	destroy: function () {
		// summary:
		//		Overrides the esri function of the same name.
		// description:
		//		Removes all dojo.connects
		console.info(this.declaredClass + "::" + arguments.callee.nom);

		dojo.forEach(this._connects, function (connect) {
			dojo.disconnect(connect);
		});
		try {
			this.inherited(arguments);
		} catch(e) {
			// swallow
		}
	}
});
