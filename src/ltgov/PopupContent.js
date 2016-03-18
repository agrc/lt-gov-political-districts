/*global dojo, dijit, console, $*/
dojo.provide("ltgov.PopupContent");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("ltgov.PopupContent", [dijit._Widget, dijit._Templated], {
	// summary:
	//		Generates the content for the popup
	
	widgetsInTemplate: false,
	
	templatePath: dojo.moduleUrl("ltgov", "templates/PopupContent.html"),
	
	// congress: String
	congress: '',
	
	// senate: String
	senate: '',
	
	// house: String
	house: '',
	
	// school: String
	school: '',
	
	precinct: '',
	
	attributeMap: {
		congress: {node: 'congressNode', type: 'innerHTML'},
		senate: {node: 'senateNode', type: 'innerHTML'},
		house: {node: 'houseNode', type: 'innerHTML'},
		school: {node: 'schoolNode', type: 'innerHTML'},
		precinct: {node: 'precinctNode', type: 'innerHTML'}
	},
	
	congressGraphic: null,
	senateGraphic: null,
	houseGraphic: null,
	schoolGraphic: null,
	precinctGraphic: null,
	
	// app: mapApp
	app: null,
	
	postCreate: function(){
		// summary:
		//		The first function to fire when the object is created
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		this.wireEvents();
		
		this.initTooltips();
	},
	initTooltips: function(){
		// summary:
		//		sets up the tooltips
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		$('.popup-row').twipsy({
			title: 'data-tooltip',
			live: true,
			placement: "right",
			delayIn: 2000
		});
	},
	wireEvents: function(){
		// summary:
		//		Wires all of the events
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		var that = this;
		this.connect(this.congressRow, 'onmouseover', function(){
			that.onRowOver(that.congressGraphic, that.congressRow);
		});
		this.connect(this.congressRow, 'onmouseout', function(){
			that.onRowOut(that.congressGraphic);
		});
		this.connect(this.congressRow, 'onclick', function(){
			that.onRowClick(that.congressGraphic);
		});
		
		this.connect(this.senateRow, 'onmouseover', function(){
			that.onRowOver(that.senateGraphic);
		});
		this.connect(this.senateRow, 'onmouseout', function(){
			that.onRowOut(that.senateGraphic);
		});
		this.connect(this.senateRow, 'onclick', function(){
			that.onRowClick(that.senateGraphic);
		});
		
		this.connect(this.houseRow, 'onmouseover', function(){
			that.onRowOver(that.houseGraphic);
		});
		this.connect(this.houseRow, 'onmouseout', function(){
			that.onRowOut(that.houseGraphic);
		});
		this.connect(this.houseRow, 'onclick', function(){
			that.onRowClick(that.houseGraphic);
		});
		
		this.connect(this.schoolRow, 'onmouseover', function(){
			that.onRowOver(that.schoolGraphic);
		});
		this.connect(this.schoolRow, 'onmouseout', function(){
			that.onRowOut(that.schoolGraphic);
		});
		this.connect(this.schoolRow, 'onclick', function(){
			that.onRowClick(that.schoolGraphic);
		});
		
		this.connect(this.precinctRow, 'onmouseover', function(){
			that.onRowOver(that.precinctGraphic);
		});
		this.connect(this.precinctRow, 'onmouseout', function(){
			that.onRowOut(that.precinctGraphic);
		});
		this.connect(this.precinctRow, 'onclick', function(){
			that.onRowClick(that.precinctGraphic);
		});
	},
	onRowOver: function(graphic, row){
		// summary:
		//		Shows the graphic
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		if (graphic){
			graphic.show();
		}
		
		$(row).twipsy('show');
	},
	onRowOut: function(graphic){
		// summary:
		//		Hides the graphic
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		if (graphic){
			graphic.hide();
		}
	},
	onRowClick: function(graphic){
		// summary:
		//		Zooms to the graphic
		console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
		
		if (graphic){
			this.app.map.setExtent(graphic.geometry.getExtent(), true);
		}
	}
});
