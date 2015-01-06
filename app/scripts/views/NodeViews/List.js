define(['backbone', 'underscore', 'jquery', 'BaseNodeView'], function (Backbone, _, $, BaseNodeView) {

    return BaseNodeView.extend({

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

            this.model.workspace.setNodeProperty({ property: "extra", _id: this.model.get('_id'), newValue: exCopy, oldValue: ex });

            this.render();
            this.model.trigger('updateRunner');
            this.model.workspace.run();
        },

        renderNode: function () {

            BaseNodeView.prototype.renderNode.apply(this, arguments);

            this.$el.find('.add-input').click(function (e) {
                this.addInput.call(this);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }.bind(this));
            this.$el.find('.remove-input').click(function (e) {
                this.removeInput.call(this);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }.bind(this));

            return this;

        },

        addInput: function () {
            var type = this.model.get('type');
            var inputConnections = this.model.get('inputConnections');

            if (type.inputs.length === 26)
                return;

            this.model.workspace.runner.post({ kind: "modelEvent", _id: this.model.get('_id'), eventName: 'AddInPort' });

            type.addInput('index' + type.inputs.length, 'Item Index #' + type.inputs.length);

            inputConnections.push([]);

            this.updatePorts();
        },

        removeInput: function () {
            var type = this.model.get('type'),
                inputConnections,
                connection;

            if (type.inputs.length === 1)
                return;

            this.model.workspace.runner.post({ kind: "modelEvent", _id: this.model.get('_id'), eventName: 'RemoveInPort' });

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