define([
    'agrc/modules/HelperFunctions',

    'dijit/registry',

    'dojo/DeferredList',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/io/script',
    'dojo/query',
    'dojo/_base/lang'
], function (
    HelperFunctions,

    registry,

    DeferredList,
    dom,
    domStyle,
    script,
    query,
    lang
) {
    var LayerVisibilities = function (app) {
        // summary:
        //        Handles the layer toggling
        console.info('LayerVisibilities:constructor', arguments);

        // properties
        this.districtsGroupName = 'districts';
        this.app = app;
        this.labelsVisibleLayers = [0,4];

        this.wireEvents();
    };
    LayerVisibilities.prototype.wireEvents = function () {
        // summary:
        //        Wires all of the events
        console.info('LayerVisibilities:wireEvents', arguments);

        var that = this;
        function wireRadioBtns(groupName) {
            query('[name=' + groupName + ']').onclick(function () {
                that.onRadioBtnClick(groupName);
            });
        }

        wireRadioBtns(this.districtsGroupName);

        this.app.districtsLayer.on('opacity-change', lang.hitch(this, function (newOpacity) {
            this.onLayerOpacityChange(newOpacity, this.app.districtsLayer, 'districts');
        }));
    };
    LayerVisibilities.prototype.onRadioBtnClick = function (groupName) {
        // summary:
        //        Fires when the user clicks on a radio btn. Changes the
        //        appropriate layer visibility
        console.info('LayerVisibilities:onRadioBtnClick', arguments);

        var value = HelperFunctions.getSelectedRadioValue(groupName);
        var districtsOpacity = registry.byId('districts-slider').slider.get('value');

        this.labelsVisibleLayers = [];
        if (!this.app.districtsLayer.visible) {
            this.app.districtsLayer.show();
        }
        if (districtsOpacity !== 0) {
            this.labelsVisibleLayers.push(value);
        }

        this.app.districtsLayer.setVisibleLayers([value]);

        if (districtsOpacity !== 0) {
            this.app.labelsLayer.setVisibleLayers(this.labelsVisibleLayers);
            if (!this.app.labelsLayer.visible) {
                this.app.labelsLayer.show();
            }
        } else {
            this.app.labelsLayer.hide();
        }
    };
    LayerVisibilities.prototype.onLayerOpacityChange = function (newOpacity, layer, groupName) {
        // summary:
        //        turns off the appropriate map layer when the opacity is set to 0
        // newOpacity: Number
        // layer: esri.Layer
        // groupName: String
        console.info('LayerVisibilities:onLayerOpacityChange', arguments);

        this.onRadioBtnClick(groupName);
    };

    return LayerVisibilities;
});
