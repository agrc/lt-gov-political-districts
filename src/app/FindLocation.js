define([
    'agrc/widgets/locate/FindAddress',

    'app/config',

    'dijit/form/ValidationTextBox',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/aspect',
    'dojo/dom-style',
    'dojo/has',
    'dojo/text!app/templates/FindLocation.html',
    'dojo/topic',
    'dojo/when',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'sherlock/providers/WebAPI',
    'sherlock/Sherlock',

    'dojox/form/BusyButton'
], function (
    FindAddress,

    config,

    ValidationTextBox,
    _WidgetsInTemplateMixin,

    aspect,
    domStyle,
    has,
    template,
    topic,
    when,
    declare,
    lang,

    WebAPI,
    Sherlock
) {
    return declare([FindAddress, _WidgetsInTemplateMixin], {
        // summary:
        //        Just to make Find Address look nicer with this web site.

        widgetsInTemplate: true,
        baseClass: 'find-address claro',

        // templateString: [private] String
        //        Path to template. See dijit._Templated
        templateString: template,

        apiKey: config.apiKey,

        // app: DistrictsMap
        app: null,

        // title: String
        title: 'Find Location',

        // sherlock: MagicZoom
        sherlock: null,

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

            var provider = new WebAPI(
                config.apiKey,
                'SGID10.BOUNDARIES.ZipCodes',
                'ZIP5'
            );
            this.sherlock = new Sherlock({
                provider: provider,
                map: this.map,
                maxResultsToDisplay: 3
            }, 'magic-zoom');
            this.sherlock.startup();

            aspect.after(this.sherlock, 'onRowClicked', lang.hitch(this, 'onMagicSearchRowClick'));
            aspect.after(this.sherlock, '_zoom', lang.hitch(this.btnGeocode, 'cancel'));
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
        },
        updateMagicZoom: function (evt) {
            // summary:
            //      mirrors the txt written to the zone text box in this widget
            //        to the magic zoom widget
            console.log('app/FindLocation:updateMagicZoom', arguments);

            this.sherlock.textBox.value = this.txtZone.get('value');
            this.sherlock._search(this.sherlock.textBox.value);
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
                this.sherlock._setMatch({
                    textContent: this.txtZone.get('value')
                });
            } else {
                this.inherited(arguments);
            }
        },
        _done: function () {
            this.btnGeocode.cancel();
        }
    });
});
