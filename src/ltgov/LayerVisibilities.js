/*global dojo, console, agrc, ltgov, esri, dijit*/
dojo.provide("ltgov.LayerVisibilities");

dojo.require("agrc.modules.HelperFunctions");
dojo.require("dojo.DeferredList");

ltgov.LayerVisibilities = function(app){
	// summary:
	//		Handles the layer toggling
	console.info("LayerVisibilities:constructor", arguments);
	
	// properties
	this.districtsGroupName = "districts";
	this.app = app;
	this.precinctsMinScale = 0;
	this.labelsVisibleLayers = [0,4];
	
	this.getLayerInfo(1, "precinctsMinScale");
	
	this.wireEvents();
};
ltgov.LayerVisibilities.prototype.getLayerInfo = function(lyrIndex, minScaleProp){
	// summary:
	//		Gets the visible scale ranges of the layers
	// lyrIndex: Number
	// minScaleProp: String
	//		The property to set the min scale to
	console.info("LayerVisibilities:getLayerInfos", arguments);
	
	var params = {
		url: this.app.precinctsBlocksServiceUrl + "/" + lyrIndex,
		handleAs: "json",
		callbackParamName: "callback",
		content: {
			f: "json"
		}
	};
	var that = this;
	dojo.io.script.get(params).then(function(data){
		that[minScaleProp] = data.minScale;
	}, function(er){
		console.error(er);
	});
};
ltgov.LayerVisibilities.prototype.wireEvents = function(){
	// summary:
	//		Wires all of the events
	console.info("LayerVisibilities:wireEvents", arguments);
	
	var that = this;
	function wireRadioBtns(groupName){
		dojo.query('[name=' + groupName + ']').onclick(function(){
			that.onRadioBtnClick(groupName);
		});
	}
	
	wireRadioBtns(this.districtsGroupName);
	
	dojo.connect(this.app.map, "onZoomEnd", this, 'onZoomEnd');
	
	dojo.connect(this.app.districtsLayer, "onOpacityChange", this, function(newOpacity){
		this.onLayerOpacityChange(newOpacity, this.app.districtsLayer, "districts");
	});
	dojo.connect(this.app.othersLayer, "onOpacityChange", this, function(newOpacity){
		this.onLayerOpacityChange(newOpacity, this.app.othersLayer, "others");
	});
};
ltgov.LayerVisibilities.prototype.onRadioBtnClick = function(groupName){
	// summary:
	//		Fires when the user clicks on a radio btn. Changes the
	//		appropriate layer visibility
	console.info("LayerVisibilities:onRadioBtnClick", arguments);
	
	var value = agrc.modules.HelperFunctions.getSelectedRadioValue(groupName);
	var districtsOpacity = dijit.byId('districts-slider').slider.get('value');
	var othersOpacity = dijit.byId('other-slider').slider.get('value');
	
	this.labelsVisibleLayers = [];
	if (!this.app.districtsLayer.visible) {
		this.app.districtsLayer.show();
		this.app.districtsCachedLayer.hide();
	}
	if (districtsOpacity !== 0) {
		this.labelsVisibleLayers.push(value);
	}
	if (othersOpacity !== 0) {
		if (this.app.showPrecincts) {
			this.labelsVisibleLayers.push(4);
		}
	}

	this.app.districtsLayer.setVisibleLayers([value]);
	
	if (districtsOpacity !== 0 || othersOpacity !== 0) {
		this.app.labelsLayer.setVisibleLayers(this.labelsVisibleLayers);
		if (!this.app.labelsLayer.visible){
			this.app.labelsLayer.show();
		}
	} else {
		this.app.labelsLayer.hide();
	}
};
ltgov.LayerVisibilities.prototype.onZoomEnd = function(extent, zoomFactor, anchor, level){
	// summary:
	//		Used to disable/enabled visible layer controls
	console.info("LayerVisibilities:onZoomEnd", arguments);
	
	if (!this.app.districtsLayer.visible) {
		this.app.districtsLayer.show();
		this.app.districtsCachedLayer.hide();
	}
	
	if (this.blocksMinScale === 0 && this.precinctsMinScale === 0){
		return;
	}
	
	var currentScale = this.app.map.getLayer(this.app.map.layerIds[0]).tileInfo.lods[level].scale;
	
	if (this.app.showPrecincts) {
		var toggleClass, sliderDisabled;
		if (currentScale > this.precinctsMinScale) {
			toggleClass = dojo.addClass;
			sliderDisabled = true;
		} else {
			toggleClass = dojo.removeClass;
			sliderDisabled = false;
		}
		toggleClass(dojo.byId('precincts-msg'));
		this.app.othersSlider.slider.set('disabled', sliderDisabled);
	}
};
ltgov.LayerVisibilities.prototype.toggleLayerControls = function(rb, lbl, span, disable){
	// summary:
	//		enables/disables the controls associated with a layer
	console.info("LayerVisibilities:toggleLayerControls", arguments);
	
	rb.disabled = disable;
	var toggleClass = (disable) ? dojo.addClass : dojo.removeClass;
	toggleClass(lbl, "disabled-text");
	toggleClass(span, "visible");
};
ltgov.LayerVisibilities.prototype.onLayerOpacityChange = function(newOpacity, layer, groupName){
	// summary:
	//		turns off the appropriate map layer when the opacity is set to 0
	// newOpacity: Number
	// layer: esri.Layer
	// groupName: String
	console.info("LayerVisibilities:onLayerOpacityChange", arguments);
	
	this.onRadioBtnClick(groupName);
};