define([
    'agrc/widgets/locate/FindAddress',

    'app/MagicZoom',

    'dijit/form/ValidationTextBox',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-style',
    'dojo/text!app/templates/FindLocation.html',
    'dojo/topic',
    'dojo/when',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    FindAddress,

    MagicZoom,

    ValidationTextBox,
    _WidgetsInTemplateMixin,

    domStyle,
    template,
    topic,
    when,
    declare,
    lang
) {
    return declare([FindAddress, _WidgetsInTemplateMixin], {
        // summary:
        //        Just to make Find Address look nicer with this web site.

        baseClass: 'find-address claro',

        // templateString: [private] String
        //        Path to template. See dijit._Templated
        templateString: template,

        // app: DistrictsMap
        app: null,

        // title: String
        title: 'Find Location',

        // magicZoom: MagicZoom
        magicZoom: null,

        postCreate: function () {
            // summary:
            //      overrides function in inherited class
            console.log('app/FindLocation:postCreate', arguments);

            this.initMagicZoom();

            this.inherited(arguments);
        },
        initMagicZoom: function () {
            // summary:
            //      sets up the magic zoom widget
            console.log('app/FindLocation:initMagicZoom', arguments);

            // TODO: change to sherlock pointed at cities/zips data
            this.magicZoom = new MagicZoom({
                mapServiceURL: this.precinctsBlocksServiceUrl,
                searchLayerIndex: 1,
                searchField: 'NAME',
                map: this.map,
                maxResultsToDisplay: 3
            }, 'magic-zoom');
            this.magicZoom.startup();

            this.connect(this.magicZoom, 'onRowClicked', 'onMagicSearchRowClick');
        },
        _wireEvents: function () {
            // summary:
            //      overrides function from inherited class
            console.log('app/FindLocation:_wireEvents', arguments);

            this.connect(this.txtAddress, 'onKeyUp', '_checkEnter');
            this.connect(this.txtZone, 'onKeyUp', 'updateMagicZoom');
        },
        _checkEnter: function () {
            // summary:
            //        Overridden to enable/disable find button
            console.log('app/FindLocation:_checkEnter', arguments);

            domStyle.set(this.errorMsg, 'display', 'none');

            var zn = this.txtZone.get('value').length;
            if (zn > 0) {
                this.btnGeocode.set('disabled', false);
            } else {
                this.btnGeocode.set('disabled', true);
            }

            // this.inherited(arguments);
        },
        updateMagicZoom: function (evt) {
            // summary:
            //      mirrors the txt written to the zone text box in this widget
            //        to the magic zoom widget
            console.log('app/FindLocation:updateMagicZoom', arguments);

            this.magicZoom.textBox.set('value', this.txtZone.get('value'));
            this.magicZoom._search(this.magicZoom.textBox.get('value'));
            this._checkEnter(evt);
        },
        onMagicSearchRowClick: function (value) {
            // summary:
            //      updates the text of the zone text box
            console.log('app/FindLocation:onMagicSearchRowClick', arguments);

            domStyle.set(this.errorMsg, 'display', 'none');

            this.txtZone.set('value', value);
        },
        geocodeAddress: function () {
            // summary:
            //        overrides to allow call to magic zoom if no address is provided
            console.log('app/FindLocation:geocodeAddress', arguments);

            domStyle.set(this.errorMsg, 'display', 'none');

            if (this.txtAddress.get('value').length === 0 &&
            this.txtZone.get('value').length > 0) {
                var def = this.magicZoom.zoom(this.txtZone.get('value'));
                var that = this;
                def.then(function () {
                    that.btnGeocode.cancel();
                }, function () {
                    that.btnGeocode.cancel();
                    domStyle.set(that.errorMsg, 'display', 'block');
                });
            } else {
                if (this._validate()) {
                    topic.publish('agrc.widgets.locate.FindAddress.OnFindStart');

                    this.btnGeocode.makeBusy();

                    if (this.map) {
                        if (this._graphic) {
                            this.graphicsLayer.remove(this._graphic);
                        }
                    }

                    var address = this.txtAddress.value;
                    var zone = this.txtZone.value;

                    var deferred = this._invokeWebService({ address: address, zone: zone });

                    when(deferred, lang.hitch(this, '_onFind'), lang.hitch(this, '_onError'));
                } else {
                    this.btnGeocode.cancel();
                }
            }
        }
    });
});
