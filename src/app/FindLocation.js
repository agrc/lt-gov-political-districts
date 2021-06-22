define([
    'agrc/widgets/locate/FindAddress',

    'app/config',

    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-style',
    'dojo/text!app/templates/FindLocation.html',
    'dojo/_base/declare'
], function (
    FindAddress,

    config,

    _WidgetsInTemplateMixin,

    domStyle,
    template,
    declare
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

        zoomLevel: 17,

        geocodeAddress: function () {
            // summary:
            console.log('app/FindLocation:geocodeAddress', arguments);

            domStyle.set(this.errorMsg, 'display', 'none');

            this.inherited(arguments);
        }
    });
});
