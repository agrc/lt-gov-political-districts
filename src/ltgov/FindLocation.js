/*global dojo, agrc, console, ltgov*/
dojo.provide("ltgov.FindLocation");

dojo.require("agrc.widgets.locate.FindAddress");
dojo.require("ltgov.MagicZoom");

dojo.declare("ltgov.FindLocation", [agrc.widgets.locate.FindAddress], {
	// summary:
	//		Just to make Find Address look nicer with this web site.

	// templatePath: [private] String
	//		Path to template. See dijit._Templated
	templatePath: dojo.moduleUrl("ltgov.templates", "FindLocation.html"),

	// app: ltgov.DistrictsMap
	app: null,

	// title: String
	title: "Find Location",

	// magicZoom: ltgov.MagicZoom
	magicZoom: null,

	postCreate: function() {
		// summary:
		//      overrides function in inherited class
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.initMagicZoom();
		
		this.inherited(arguments);
	},
	initMagicZoom: function() {
		// summary:
		//      sets up the magic zoom widget
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

		this.magicZoom = new ltgov.MagicZoom({
			mapServiceURL: this.app.precinctsBlocksServiceUrl,
			searchLayerIndex: 1,
			searchField: 'NAME',
			map: this.map,
			maxResultsToDisplay: 3
		}, 'magic-zoom');
		this.magicZoom.startup();
		
		this.connect(this.magicZoom, 'onRowClicked', 'onMagicSearchRowClick');
	},
	_wireEvents: function() {
		// summary:
		//      overrides function from inherited class
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.connect(this.txt_address, 'onKeyUp', "_checkEnter");
		this.connect(this.txt_zone, 'onKeyUp', 'updateMagicZoom');
	},
	_checkEnter: function() {
		// summary:
		//		Overridden to enable/disable find button
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		dojo.style(this.errorMsg, 'display', 'none');

		var zn = this.txt_zone.get('value').length;
		if(zn > 0) {
			this.btn_geocode.set("disabled", false);
		} else {
			this.btn_geocode.set("disabled", true);
		}

		// this.inherited(arguments);
	},
	updateMagicZoom: function(evt) {
		// summary:
		//      mirrors the txt written to the zone text box in this widget
		//		to the magic zoom widget
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.magicZoom.textBox.set('value', this.txt_zone.get('value'));
		this.magicZoom._search(this.magicZoom.textBox.get('value'));
		this._checkEnter(evt);
	},
	onMagicSearchRowClick: function(value){
		// summary:
		//      updates the text of the zone text box
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		dojo.style(this.errorMsg, 'display', 'none');
		
		this.txt_zone.set('value', value);
	},
	geocodeAddress: function () {
		// summary:
		//		overrides to allow call to magic zoom if no address is provided
		console.info(this.declaredClass + '::' + arguments.callee.nom);
		
		dojo.style(this.errorMsg, 'display', 'none');
		
		if (this.txt_address.get('value').length === 0 && 
			this.txt_zone.get('value').length > 0) {
			var def = this.magicZoom.zoom(this.txt_zone.get('value'));
			var that = this;
			def.then(function(){
				that.btn_geocode.cancel();
			}, function(){
				that.btn_geocode.cancel();
				dojo.style(that.errorMsg, 'display', 'block');
			});
		} else {
			if (this._validate()) {
				dojo.publish('agrc.widgets.locate.FindAddress.OnFindStart');
	
				this.btn_geocode.makeBusy();
	
				if (this.map) {
					if (this._graphic) {
						this.graphicsLayer.remove(this._graphic);
					}
				}
	
				var address = this.txt_address.value;
				var zone = this.txt_zone.value;
	
				var deferred = this._invokeWebService({ address: address, zone: zone });
	
				dojo.when(deferred, dojo.hitch(this, '_onFind'), dojo.hitch(this, '_onError'));
			}
			else {
				this.btn_geocode.cancel();
			}
		}
	}
});
