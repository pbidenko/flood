define(['backbone', 'underscore', 'jquery', 'BaseNodeView'], function (Backbone, _, $, BaseNodeView) {

    return BaseNodeView.extend({

        events: _.extend(BaseNodeView.prototype.events, {
            'click .add-input': 'addInput',
            'click .remove-input': 'removeInput'
        }),

        innerTemplate: _.template($('#variable-input-template').html()),

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

            this.model.workspace.setNodeProperty({ property: "extra", _id: this.model.get('_id'), newValue: exCopy, oldValue: ex });

            this.render();
            this.model.trigger('updateRunner');
            this.model.workspace.run();
        },

        addInput: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var type = this.model.get('type'),
                inputConnections = this.model.get('inputConnections');

            if (type.inputs.length === 26)
                return;

            this.model.trigger('addInPort', this.model);

            type.addInput(this.getPortName(type.inputs.length), this.getPortDescription(type.inputs.length));

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

        getPortName: function(data){
            return data;
        },

        getPortDescription: function(data){
            return data;
        }

    });

});