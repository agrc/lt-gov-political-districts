/*global dojo, console, window, esri, dojo, alert*/
/*jslint sub:true*/
dojo.provide('ltgov.PrintMap');

dojo['require']('esri.tasks.gp');

dojo.declare('ltgov.PrintMap', null, {
    // summary:
    //      Handles printing the map

    // gpUrl: String
    //      The url to the ExportToPDF service
    gpUrl: 'http://mapserv.utah.gov/ArcGIS/rest/services/LtGovVotingDistricts/Toolbox/GPServer/ExportToPDF',
    // gpUrl: 'http://localhost/ArcGIS/rest/services/LtGovVotingDistricts/Toolbox/GPServer/ExportToPDF',

    // gp: esri.tasks.Geoprocessor
    gp: null,

    // def: dojo.Deferred
    def: null,

    // map: esri.Map
    //      A reference to the map
    map: null,

    // districtsLayer: esri.layers.ArcGISDynamicMapServiceLayer
    districtsLayer: null,

    // othersLayer: esri.layers.ArcGISDynamicMapServiceLayer
    othersLayer: null,

    // labelsLayer: esri.layers.ArcGISDynamicMapServiceLayer
    labelsLayer: null,

    // baseMapSelector: agrc.widgets.map.BaseMapSelector
    baseMapSelector: null,

    // labels: Object
    labels: {
        '0': 'US Congress',
        '1': 'State Senate',
        '2': 'State House',
        '3': 'State Board of Education'
    },

    // passed in via the constructor

    // app: ltgov.DistrictsMap
    app: null,


    constructor: function(params) {
        // summary:
        //      Fires when the object is created. Mixes in the params
        console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

        dojo.mixin(this, params);

        this.map = this.app.map;
        this.districtsLayer = this.app.districtsLayer;
        this.othersLayer = this.app.othersLayer;
        this.labelsLayer = this.app.labelsLayer;
        this.baseMapSelector = this.app.baseMapSelector;

        // this.gpUrl = this.app.server + this.gpUrl;

        this.gp = new esri.tasks.Geoprocessor(this.gpUrl);

        this.wireEvents();
    },
    wireEvents: function() {
        // summary:
        //      wires all of the events for this class
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        dojo.connect(this.gp, "onJobComplete", this, 'onJobComplete');
        dojo.connect(this.gp, "onStatusUpdate", this, 'onStatusUpdate');
        dojo.connect(this.gp, "onError", this, 'onJobError');
        dojo.connect(this.gp, "onGetResultDataComplete", this, 'onGetResultDataComplete');
    },
    print: function(layerName) {
        // summary:
        //      Prints the map to a PDF
        console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

        this.def = new dojo.Deferred();

        var input = {
            layerInfos: this.getLayerInfos(),
            stringReplaces: dojo.toJson({
                LayerName: this.getVisibleDistrictLayer()
            })
        };

        dojo.mixin(input, this.getExtent());

        console.log(input);

        this.gp.submitJob(input);

        return this.def;
    },
    getExtent: function() {
        // summary:
        //      Gets the bounding box of the map extent
        // returns: String
        //      A json representation of the bounding box
        console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

        var extent = this.map.extent;

        return {
            xMin: extent.xmin,
            yMin: extent.ymin,
            xMax: extent.xmax,
            yMax: extent.ymax
        };
    },
    getLayerInfos: function(){
        // summary:
        //      Gets the visible layers from each of the layers
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        var layerInfos = {};
        function buildLayerInfos(layer){
            dojo.forEach(layer.layerInfos, function(info) {
                layerInfos[info.name] = {
                    visible: (dojo.indexOf(layer.visibleLayers, info.id) !== -1),
                    opacity: layer.opacity
                };
            }, this);
        }

        buildLayerInfos(this.districtsLayer);
        buildLayerInfos(this.othersLayer);
        if (this.labelsLayer.visible) {
            buildLayerInfos(this.labelsLayer);
        }

        // get basemap layer
        var lbl = this.baseMapSelector.currentTheme.label;
        layerInfos[lbl] = {
            visible: true,
            opacity: 1
        };

        return dojo.toJson(layerInfos);
    },
    get_graphics: function() {
        // summary:
        //      gets the graphics to be printed from the map
        // returns: String
        //      a json string
        console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

        var fLayer = this.map.graphics;

        var data = [];
        dojo.forEach(fLayer.graphics, function(g) {
            var dShape = g.getDojoShape();

            if(dShape) {
                var gdata = {
                    style: {
                        lineWidth: dShape.strokeStyle.width,
                        lineOpacity: fLayer.opacity,
                        lineColor: dShape.strokeStyle.color.toHex(),
                        fillOpacity: fLayer.opacity,
                        fillColor: dShape.fillStyle.toHex()
                    },
                    geometry: {
                        rings: g.geometry.rings
                    }
                };
                data.push(gdata);
            }
        }, this);
        return dojo.toJson(data);
    },
    onJobComplete: function(status) {
        // summary:
        //      Fires when the print job is complete
        // status: esri.tasks.JobInfo
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        if(status.jobStatus == "esriJobSucceeded") {
            this.gp.getResultData(status.jobId, 'outFile');
        } else {
            this.onJobError({
                message: status.jobStatus
            });
        }
    },
    onStatusUpdate: function(status) {
        // summary:
        //      Fires when the status for the print job updates
        // status: esri.tasks.JobInfo
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
    },
    onJobError: function(er) {
        // summary:
        //      Fires when the print job returns an error
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        console.error(er);

        alert("There was an error with the print service!\n" + er.message);

        this.def.resolve(false);
    },
    onGetResultDataComplete: function(result) {
        // summary:
        //      Fires when the result of the task is available
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        this.def.resolve(true);

        dojo.create('a', {
            href: result.value.url,
            target: "_blank",
            innerHTML: 'Click here for your map'
        }, 'print-results');
    },
    getVisibleDistrictLayer: function(){
        // summary:
        //      Gets the name of the currently visible districts layer
        console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

        function getSelectedRadio(buttonGroup) {
            // returns the array number of the selected radio button or -1 if no button is selected
            if(buttonGroup[0]) {// if the button group is an array (one button is not an array)
                for(var i = 0; i < buttonGroup.length; i++) {
                    if(buttonGroup[i].checked) {
                        return i;
                    }
                }
            } else {
                if(buttonGroup.checked) {
                    return 0;
                } // if the one button is checked, return zero
            }
            // if we get to this point, no radio button is selected
            return -1;
        }

        var group = dojo.query("input[name=districts]");
        var rBtn = group[getSelectedRadio(group)];

        return this.labels[rBtn.value];
    }
});
