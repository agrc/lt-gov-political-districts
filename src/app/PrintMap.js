define([
    'app/config',

    'dojo/Deferred',
    'dojo/dom-construct',
    'dojo/query',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/tasks/PrintParameters',
    'esri/tasks/PrintTask',
    'esri/tasks/PrintTemplate'
], function (
    config,

    Deferred,
    domConstruct,
    query,
    declare,
    lang,

    PrintParameters,
    PrintTask,
    PrintTemplate
) {
    return declare(null, {
        // summary:
        //      Handles printing the map

        // task: PrintTask
        task: null,

        // map: esri.Map
        //      A reference to the map
        map: null,

        // labels: Object
        labels: {
            '0': 'US Congress',
            '1': 'State Senate',
            '2': 'State House',
            '3': 'State Board of Education'
        },


        // passed in via the constructor

        // app: app.DistrictsMap
        app: null,

        constructor: function (params) {
            // summary:
            //      Fires when the object is created. Mixes in the params
            console.log('app/PrintMap:constructor', arguments);

            lang.mixin(this, params);

            this.map = this.app.map;

            this.task = new PrintTask(config.urls.printProxy);

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      wires all of the events for this class
            console.log('app/PrintMap:wireEvents', arguments);

            this.task.on('error', lang.hitch(this, 'onJobError'));
            this.task.on('complete', lang.hitch(this, 'onComplete'));
        },
        print: function () {
            // summary:
            //      Prints the map to a PDF
            console.log('app/PrintMap:print', arguments);

            var params = new PrintParameters();
            var template = new PrintTemplate();
            template.format = 'PDF';
            template.layout = 'Portrait';
            template.layoutOptions = {
                titleText: '2012 Utah ' + this.getVisibleDistrictLayer() + ' Districts'
            };
            params.map = this.map;
            params.template = template;

            return this.task.execute(params);
        },
        onJobError: function (er) {
            // summary:
            //      Fires when the print job returns an error
            console.log('app/PrintMap:onJobError', arguments);

            alert('There was an error with the print service!\n' + er.message);
        },
        onComplete: function (response) {
            // summary:
            //      Fires when the result of the task is available
            console.log('app/PrintMap:onComplete', arguments);

            domConstruct.create('a', {
                href: response.result.url,
                target: '_blank',
                innerHTML: 'Click here for your map'
            }, 'print-results');
        },
        getVisibleDistrictLayer: function () {
            // summary:
            //      Gets the name of the currently visible districts layer
            console.log('app/PrintMap:getVisibleDistrictLayer', arguments);

            function getSelectedRadio(buttonGroup) {
                // returns the array number of the selected radio button or -1 if no button is selected
                if (buttonGroup[0]) {// if the button group is an array (one button is not an array)
                    for (var i = 0; i < buttonGroup.length; i++) {
                        if (buttonGroup[i].checked) {
                            return i;
                        }
                    }
                } else {
                    if (buttonGroup.checked) {
                        return 0;
                    } // if the one button is checked, return zero
                }
                // if we get to this point, no radio button is selected
                return -1;
            }

            var group = query('input[name=districts]');
            var rBtn = group[getSelectedRadio(group)];

            return this.labels[rBtn.value];
        }
    });
});
