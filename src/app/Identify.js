define([
    'app/config',
    'app/PopupContent',

    'dojo/dom-construct',
    'dojo/_base/Color',
    'dojo/_base/lang',

    'esri/dijit/Popup',
    'esri/graphic',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/tasks/IdentifyParameters',
    'esri/tasks/IdentifyTask'
], function (
    config,
    PopupContent,

    domConstruct,
    Color,
    lang,

    Popup,
    Graphic,
    SimpleFillSymbol,
    SimpleMarkerSymbol,
    IdentifyParameters,
    IdentifyTask
) {
    var Identify = function (app) {
        // summary:
        //        Handles clicking on the map and showing an info window with the districts
        console.info('Identify:constructor', arguments);

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
        //        Used to position the popup
        this.screenPoint = null;

        // pContent: app.pContent
        //        The widget that displays the contents of the popup
        this.pContent = null;

        // symbol: SimpleFillSymbol
        //        The symbol used to display the districts
        this.symbol = new SimpleFillSymbol();

        // marker: SimpleMarkerSymbol
        //        The symbol used to mark the identify location
        this.marker = new SimpleMarkerSymbol()
            .setStyle(SimpleMarkerSymbol.STYLE_DIAMOND)
            .setColor(new Color([255, 0, 0, 0.5]));

        this.initPopup();

        this.initIdentifyTask();
    };

    Identify.prototype.initPopup = function () {
        // summary:
        //        sets up the popup
        console.info('Identify:initPopup', arguments);

        this.popup = new Popup({}, domConstruct.create('div'));
        this.popup.resize(295, 143);
        this.popup.setTitle('Map Point Areas');

        this.pContent = new PopupContent({app: this.app}, domConstruct.create('div'));

        this.popup.setContent(this.pContent.domNode);

        this.pContent.initTooltips();
    };

    Identify.prototype.initIdentifyTask = function () {
        // summary:
        //        sets up the identify task
        console.info('Identify:initIdentifyTask', arguments);

        this.task = new IdentifyTask(config.urls.districts);

        this.iParams = new IdentifyParameters();
        this.iParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
        this.iParams.returnGeometry = true;
        this.iParams.tolerance = 1;
    };

    Identify.prototype.wireEvents = function () {
        // summary:
        //        wires all of the events
        console.info('Identify:wireEvents', arguments);

        this.app.map.on('click', lang.hitch(this, 'onMapClick'));
        this.task.on('complete', lang.hitch(this, 'onTaskComplete'));
        this.task.on('error', lang.hitch(this, 'onTaskError'));
        this.popup.on('hide', lang.hitch(this, function () {
            this.app.map.graphics.clear();
        }));
        this.app.map.on('load', lang.hitch(this, function () {
            this.app.map.graphics.disableMouseEvents();
        }));
    };

    Identify.prototype.onMapClick = function (evt) {
        // summary:
        //        Fires when the user clicks on the map
        // evt: esri.Map:onClick event object
        console.info('Identify:onMapClick', arguments);

        this.identifyPoint(evt.mapPoint);

        var g = new Graphic(evt.mapPoint, this.marker, {}, {});
        this.app.map.graphics.add(g);
    };

    Identify.prototype.identifyPoint = function (pnt) {
        // summary:
        //        Identifies the pnt
        // pnt: esri.geometry.Point
        console.info('Identify:identifyPoint', arguments);

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

    Identify.prototype.onTaskComplete = function (iResults) {
        // summary:
        //        callback from identify task
        // iResults: IdentifyResult[]
        console.info('Identify:onTaskComplete', arguments);

        if (iResults.length === 0) {
            alert('There were no districts found for this location.');
        } else {
            this.getContent(iResults.results);

            this.loadGraphics(iResults.results);

            this.popup.show(this.screenPoint);
        }

        this.app.map.hideLoader();
    };

    Identify.prototype.getContent = function (iResults) {
        // summary:
        //        generates the content for the popup box
        console.info('Identify:getContent', arguments);

        function getValue(result, fieldName) {
            var value = result.feature.attributes[fieldName];
            return value || '';
        }

        iResults.forEach(function (result) {
            switch (result.layerName) {
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
            }
        }, this);
    };

    Identify.prototype.loadGraphics = function (iResults) {
        // summary:
        //        loads the identify graphics into the map's graphics layer
        console.info('Identify:loadGraphics', arguments);

        iResults.forEach(function (result) {
            var g = result.feature;
            g.setSymbol(this.symbol);
            g.hide();
            this.app.map.graphics.add(result.feature);
            switch (result.layerName) {
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
            }
        }, this);
    };

    Identify.prototype.onTaskError = function (e) {
        // summary:
        //        fires when the task returns an error
        console.info('Identify:onTaskError', arguments);

        alert('There was an error returned from the identify query.');
        console.error(e);

        this.app.map.hideLoader();
    };

    // constants
    Identify.prototype.Congress = 'Congress';
    Identify.prototype.Senate = 'State Senate';
    Identify.prototype.House = 'State House';
    Identify.prototype.School = 'State School Board';

    // field names
    Identify.prototype.fieldNames = {
        Congress: {
            DISTRICT: 'DISTRICT'
        },
        Senate: {
            DIST: 'DIST'
        },
        House: {
            DIST: 'DIST'
        },
        School: {
            DIST: 'DIST'
        }
    };

    return Identify;
});
