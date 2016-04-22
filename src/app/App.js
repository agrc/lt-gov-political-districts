define([
    'agrc/widgets/layer/OpacitySlider',
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/FindLocation',
    'app/Identify',
    'app/LayerVisibilities',
    'app/PrintMap',

    'dijit/Dialog',
    'dijit/Tooltip',
    'dijit/_Templated',
    'dijit/_Widget',

    'dojo/dom',
    'dojo/query',
    'dojo/text!app/templates/App.html',
    'dojo/_base/declare',

    'dojox/charting/action2d/Base',
    'dojox/charting/Chart',
    'dojox/charting/Chart2D',
    'dojox/charting/themes/PlotKit/base',
    'dojox/fx',
    'dojox/fx/scroll',
    'dojox/lang/functional/scan',

    'esri/dijit/HomeButton',
    'esri/dijit/Popup',
    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/GraphicsLayer',

    'layer-selector/LayerSelector',

    'dojox/form/BusyButton'
], function (
    OpacitySlider,
    BaseMap,

    config,
    FindLocation,
    Identify,
    LayerVisibilities,
    PrintMap,

    Dialog,
    Tooltip,
    _Templated,
    _Widget,

    dom,
    query,
    template,
    declare,

    Base,
    Chart,
    Chart2D,
    base,
    fx,
    scroll,
    scan,

    HomeButton,
    Popup,
    Extent,
    Point,
    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer,
    GraphicsLayer,

    LayerSelector
) {
    return declare([_Widget, _Templated], {
        // summary:
        //        The app object in charge of the app as a whole

        baseClass: 'districts-map',

        // map: BaseMap
        map: null,

        // districtsLayer: ArcGISDynamicMapServiceLayer
        districtsLayer: null,

        // labelsLayer: ArcGISDynamicMapServiceLayer
        labelsLayer: null,

        // identify: Identify
        identify: null,

        // widgetsInTemplate: [private] Boolean
        //      Specific to dijit._Templated.
        widgetsInTemplate: true,

        // templateString: [private] String
        //      Path to template. See dijit._Templated
        templateString: template,

        // baseClass: String
        baseClass: 'districts-map',

        // printMap: PrintMap
        printMap: null,

        // Parameters to constructor

        constructor: function () {
            // summary:
            //    Constructor method
            // params: Object
            //    Parameters to pass into the widget. Required values include:
            // div: String|DomNode
            //    A reference to the div that you want the widget to be created in.
            console.log('app/App:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/App:postCreate', arguments);

            this.initMap();

            this.initSliders();

            new LayerVisibilities(this);

            this.initFindLocation();

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      wires all of the events
            console.log('app/App:wireEvents', arguments);

            var that = this;
            query('.pdf-link-small').onclick(function (evt) {
                that.onPDFLinkClick(evt, that.pdfDialogSmall, that.smallDialogSizer);
            });
            query('.pdf-link-large').onclick(function (evt) {
                that.onPDFLinkClick(evt, that.pdfDialogLarge, that.largeDialogSizer);
            });
        },
        initMap: function () {
            // summary:
            //      sets up the map
            console.log('app/App:initMap', arguments);

            this.identify = new Identify(this);

            var mapOptions = {
                useDefaultBaseMap: false,
                includeFullExtentButton: true,
                infoWindow: this.identify.popup,
                extent: new Extent({
                    xmax: -11762120.612131765,
                    xmin: -13074391.513731329,
                    ymax: 5225035.106177688,
                    ymin: 4373832.359194187,
                    spatialReference: {
                        wkid: 3857
                    }
                })
            };

            this.map = new BaseMap('map-div', mapOptions);

            this.map.showLoader();

            this.identify.wireEvents();

            var that = this;
            this.map.on('load', function () {
                that.map.disableScrollWheelZoom();
            });

            var selector = new LayerSelector({
                map: this.map,
                quadWord: config.quadWord,
                baseLayers: ['Lite', 'Hybrid']
            });
            selector.startup();

            this.districtsLayer = new ArcGISDynamicMapServiceLayer(config.urls.districts, {
                opacity: 0.5,
                visible: true
            });
            this.map.addLayer(this.districtsLayer);
            this.map.addLoaderToLayer(this.districtsLayer);
            this.labelsLayer = new ArcGISDynamicMapServiceLayer(config.urls.labels, {
                visible: true
            });
            this.map.addLayer(this.labelsLayer);
            this.map.addLoaderToLayer(this.labelsLayer);
        },
        initSliders: function () {
            // summary:
            //      Sets up the layer opacity sliders
            console.log('app/App:initSliders', arguments);

            var slider = new OpacitySlider({
                mapServiceLayer: this.districtsLayer
            }, 'districts-slider');
            slider.startup();
        },
        initFindLocation: function () {
            // summary:
            //      Sets up the find address widget
            console.log('app/App:initFindLocation', arguments);

            // create new graphics layer to prevent conflicts
            var gLayer = new GraphicsLayer();
            this.map.addLayer(gLayer);

            var f = new FindLocation({
                map: this.map,
                graphicsLayer: gLayer,
                app: this,
                wkid: 26912
            }, 'find-location');

            var that = this;
            f.on('find', function (result) {
                var defZoom;
                var defPan;
                function identify() {
                    defZoom.remove();
                    defPan.remove();

                    var pnt = new Point(result.location.x, result.location.y, that.map.spatialReference);
                    that.identify.identifyPoint(pnt);
                }

                defZoom = that.map.on('zoom-end', function () {
                    identify();
                });
                defPan = that.map.on('pan-end', function () {
                    identify();
                });
            });
        },
        onPDFLinkClick: function (evt, dialog, sizer) {
            // summary:
            //      opens the dialog and scrolls to the header
            // evt: Click event
            // dialog: dojo dialog
            // sizer: div
            console.log('app/App:onPDFLinkClick', arguments);

            var headerID = evt.currentTarget.name;

            evt.preventDefault();
            evt.stopPropagation();

            dialog.show();

            window.setTimeout(function () {
                fx.smoothScroll({
                    node: dom.byId(headerID),
                    win: sizer
                }).play();
            }, 250);
        },
        onPrintBtnClick: function () {
            // summary:
            //      calls the print web service
            console.log('app/App:onPrintBtnClick', arguments);

            dom.byId('print-results').innerHTML = '';

            if (!this.printMap) {
                this.printMap = new PrintMap({
                    app: this
                });
            }

            var that = this;
            this.printMap.print().then(function () {
                that.printBtn.cancel();
            }, function () {
                alert('There was an error printing your map!');
                that.printBtn.cancel();
            });
        },
        onMoreInfoClick: function (e) {
            // summary:
            //      fires when the user clicks on the more info link in the disclaimer
            //        shows the more info dialog
            console.log('app/App:onMoreInfoClick', arguments);

            e.preventDefault();
            e.stopPropagation();

            this.moreInfoDialog.show();
        },
        onMoreInfoOkClick: function () {
            // summary:
            //      fires when the user clicks the OK button on the more info dialog
            //        closes the dialog
            console.log('app/App:onMoreInfoOkClick', arguments);

            this.moreInfoDialog.hide();
        }
    });
});
