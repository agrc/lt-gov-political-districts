define([
    'dijit/_Templated',
    'dijit/_Widget',

    'dojo/text!app/templates/PopupContent.html',
    'dojo/_base/declare'
], function (
    _Templated,
    _Widget,

    template,
    declare
) {
    return declare([_Widget, _Templated], {
        // summary:
        //        Generates the content for the popup

        baseClass: 'popup-content',
        templateString: template,

        // congress: String
        congress: '',

        // senate: String
        senate: '',

        // house: String
        house: '',

        // school: String
        school: '',

        attributeMap: {
            congress: {node: 'congressNode', type: 'innerHTML'},
            senate: {node: 'senateNode', type: 'innerHTML'},
            house: {node: 'houseNode', type: 'innerHTML'},
            school: {node: 'schoolNode', type: 'innerHTML'}
        },

        congressGraphic: null,
        senateGraphic: null,
        houseGraphic: null,
        schoolGraphic: null,

        // app: mapApp
        app: null,

        postCreate: function () {
            // summary:
            //        The first function to fire when the object is created
            console.log('app/PopupContent:postCreate', arguments);

            this.wireEvents();
        },
        initTooltips: function () {
            // summary:
            //        sets up the tooltips
            console.log('app/PopupContent:initTooltips', arguments);

            // not worth loading a second jquery
            // $('.popup-row', this.domNode).tooltip({
            //     title: 'click to zoom',
            //     placement: 'right',
            //     container: 'body',
            //     delay: { show: 2000, hide: 50 }
            // });
        },
        wireEvents: function () {
            // summary:
            //        Wires all of the events
            console.log('app/PopupContent:wireEvents', arguments);

            var that = this;
            this.connect(this.congressRow, 'onmouseover', function () {
                that.onRowOver(that.congressGraphic, that.congressRow);
            });
            this.connect(this.congressRow, 'onmouseout', function () {
                that.onRowOut(that.congressGraphic);
            });
            this.connect(this.congressRow, 'onclick', function () {
                that.onRowClick(that.congressGraphic);
            });

            this.connect(this.senateRow, 'onmouseover', function () {
                that.onRowOver(that.senateGraphic, that.senateRow);
            });
            this.connect(this.senateRow, 'onmouseout', function () {
                that.onRowOut(that.senateGraphic);
            });
            this.connect(this.senateRow, 'onclick', function () {
                that.onRowClick(that.senateGraphic);
            });

            this.connect(this.houseRow, 'onmouseover', function () {
                that.onRowOver(that.houseGraphic, that.houseRow);
            });
            this.connect(this.houseRow, 'onmouseout', function () {
                that.onRowOut(that.houseGraphic);
            });
            this.connect(this.houseRow, 'onclick', function () {
                that.onRowClick(that.houseGraphic);
            });

            this.connect(this.schoolRow, 'onmouseover', function () {
                that.onRowOver(that.schoolGraphic, that.schoolRow);
            });
            this.connect(this.schoolRow, 'onmouseout', function () {
                that.onRowOut(that.schoolGraphic);
            });
            this.connect(this.schoolRow, 'onclick', function () {
                that.onRowClick(that.schoolGraphic);
            });
        },
        onRowOver: function (graphic) {
            // summary:
            //        Shows the graphic
            console.log('app/PopupContent:onRowOver', arguments);

            if (graphic) {
                graphic.show();
            }
        },
        onRowOut: function (graphic) {
            // summary:
            //        Hides the graphic
            console.log('app/PopupContent:onRowOut', arguments);

            if (graphic) {
                graphic.hide();
            }
        },
        onRowClick: function (graphic) {
            // summary:
            //        Zooms to the graphic
            console.log('app/PopupContent:onRowClick', arguments);

            if (graphic) {
                this.app.map.setExtent(graphic.geometry.getExtent(), true);
            }
        }
    });
});
