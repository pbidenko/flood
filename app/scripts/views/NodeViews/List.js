define(['backbone', 'underscore', 'jquery', 'BaseNodeView'], function (Backbone, _, $, BaseNodeView) {

    return BaseNodeView.extend({

        events: _.extend(BaseNodeView.prototype.events, {
            'click .add-input': 'addInput',
            'click .remove-input': 'removeInput'
        }),

        initialize: function (args) {
            BaseNodeView.prototype.initialize.apply(this, arguments);
        },

        innerTemplate: _.template($('#node-list-template').html()),

        getCustomContents: function () {
            var json = this.model.toJSON();

            return this.innerTemplate(json);
        },

        updatePorts: function () {
            var type = this.model.get('type');
            var ex = this.model.get('extra');
            var exCopy = JSON.parse(JSON.stringify(ex));
            var ignoreDefaults = type.inputs.map(function (x) {
                return !x.useDefault;
            });
            exCopy.varInputs = type.inputs.map(function (port) {
                return { name: port.name, type: port.typeName };
            });

            this.model.set('ignoreDefaults', ignoreDefaults);

            var cmd = { property: "extra", _id: this.model.get('_id'), newValue: exCopy, oldValue: ex };
            this.model.trigger('request-set-node-prop', cmd);

            this.render();
            this.model.trigger('update-node');
            this.model.trigger('requestRun');
        },

        addInput: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var type = this.model.get('type'),
                inputConnections = this.model.get('inputConnections');

            if (type.inputs.length === 26)
                return;

            this.model.trigger('addInPort', this.model);

            type.addInput('index' + type.inputs.length, 'Item Index #' + type.inputs.length);

            inputConnections.push([]);

            this.updatePorts();
        },

        removeInput: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var type = this.model.get('type'),
                inputConnections,
                connection;

            if (type.inputs.length === 1)
                return;

            this.model.trigger('removeInPort', this.model);

            inputConnections = this.model.get('inputConnections');
            connection = inputConnections[type.inputs.length - 1];

            if (connection && connection[0]) {
                connection[0].silentRemove = true;
            }
            this.model.disconnectPort(type.inputs.length - 1, null, false);

            inputConnections.pop();

            type.removeInput();

            this.updatePorts();
        },

        colorPorts: function() {
            BaseNodeView.prototype.colorPorts.apply(this, arguments);

            this.model.trigger('change:position');

            return this;
        }

    });

});