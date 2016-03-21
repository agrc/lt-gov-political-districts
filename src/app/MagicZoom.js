define([
    'agrc/widgets/locate/MagicZoom',

    'dojo/text!app/templates/MagicZoom.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dijit/form/ValidationTextBox'
], function (
    MagicZoom,

    template,
    declare,
    lang
) {
    return declare([MagicZoom], {
        baseClass: 'magic-zoom',
        templateString: template,

        _processResults: function (features) {
            // summary:
            //        Processes the features returned from the query task.
            // features: Object[]
            //        The features returned from the query task.
            // tags:
            //        private
            console.log('app/MagicZoom:_processResults', arguments);

            try {
                console.info(features.length + ' search features found.');

                // remove duplicates
                features = this._removeDuplicateResults(features);

                // get number of unique results
                var num = features.length;
                console.info(num + ' unique results.');

                // return if too many values or no values
                if (num > this.maxResultsToDisplay) {
                    this.textBox.displayMessage('More than ' + this.maxResultsToDisplay + ' matches found. Keep typing...');
                } else if (num === 0) {
                    this.textBox.displayMessage('There are no matches.');
                } else {
                    this.textBox.displayMessage('');

                    this._populateTable(features);

                    if (features[0].attributes[this.searchField].toUpperCase() === this.textBox.get('value').toUpperCase()) {
                        this._toggleTable(false);
                    }
                }
            } catch (e) {
                throw new Error(this.declaredClass + '_processResults: ' + e.message);
            }
        },
        _setMatch: function (row) {
            // summary:
            //        overridden
            // row: Object
            //        The row object that you want to set the textbox to.
            // tags:
            //        private
            console.log('app/MagicZoom:_setMatch', arguments);

            // clear prompt message
            this.textBox.displayMessage('');

            // clear any old graphics
            this._graphicsLayer.clear();

            // set textbox to full value
            this.textBox.textbox.value = row.cells[0].innerHTML.replace(/(<([^>]+)>)/ig, '').trim();

            // clear table
            this._toggleTable(false);

            this.onRowClicked(this.textBox.get('value'));
        },
        onRowClicked: function () {
            // summary:
            //      empty function for FindLocation to hook to
            console.log('app/MagicZoom:onRowClicked', arguments);
        },
        zoom: function (text) {
            // summary:
            //      zooms to the first match
            // test: String
            // returns: dojo.Deferred
            console.log('app/MagicZoom:zoom', arguments);

            this._graphicsLayer.clear();

            // switch to return geometry and build where clause
            this.query.returnGeometry = true;
            this.query.where = 'UPPER(' + this.searchField + ') = UPPER(' + text + ')';
            var def = this.queryTask.execute(this.query, lang.hitch(this, function (featureSet) {
                // set switch to prevent graphic from being cleared
                this._addingGraphic = true;

                if (featureSet.features.length === 0) {
                    def.errback();
                    return;
                }
                if (featureSet.features.length === 1 || featureSet.features[0].geometry.type === 'polygon') {
                    this._zoom(featureSet.features[0]);
                } else {
                    this._zoomToMultipleFeatures(featureSet.features);
                }

                // set return geometry back to false
                this.query.returnGeometry = false;
            }));
            return def;
        },
        _onQueryTaskError: function () {
            // summary:
            //        Handles when there is an error returned from the query task.
            // error: Error
            //        The error object returned from the query task.
            // tags:
            //        private
            console.log('app/MagicZoom:_onQueryTaskError', arguments);

            // swallow all errors
        }
    });
});
