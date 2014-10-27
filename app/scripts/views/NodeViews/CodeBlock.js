define(['backbone', 'BaseNodeView'], function (Backbone, BaseNodeView) {

    return BaseNodeView.extend({

        innerTemplate: _.template($('#code-block-template').html()),

        initialize: function (args) {

            BaseNodeView.prototype.initialize.apply(this, arguments);
            this.model.on('change:extra', this.onChangedExtra, this);
            this.model.on('connections-update', this.onConnectionsUpdate, this);
            this.model.on('cbn-up-to-date', this.finishEvaluating, this);
        },

        getCustomContents: function () {

            var json = this.model.toJSON();

            return this.innerTemplate(json);

        },

        finishEvaluating: function() {
            this.$el.removeClass('node-evaluating');
        },

        onChangedExtra: function () {
            this.render();
            this.$el.addClass('node-evaluating');
            this.model.trigger('updateRunner');
            this.model.workspace.run();
        },

        onConnectionsUpdate: function () {
            var ex = this.model.get('extra') || {};

            this.removeConnections(ex);

            if (ex.inputs !== undefined) {
                this.setInputConnections();
                this.setInputsProperty(ex.inputs);
                this.model.get('type').setInputs(ex.inputs);
            }
            if (ex.outputs !== undefined) {
                this.setOutputConnections();
                this.setOutputsProperty(ex.outputs);
                this.model.get('type').setOutputs(ex.outputs);
            }

            this.render();
            this.model.trigger('change:position');
            this.finishEvaluating();
        },

        removeConnections: function (ex) {
            var i,
                len,
                conn,
                ports,
                port,
                oldPort,
                newIndex;

            ports = this.model.getPorts(false);
            len = ports.length;
            // need to delete connections from all input ports
            // that doesn't exist anymore
            for (i = len - 1; i >= 0; i--) {
                oldPort = ex.oldInputs[i];
                newIndex = ex.inputs.indexOf(oldPort);
                // if this input port was deleted
                if (newIndex == -1) {
                    port = ports[i];
                    if (port && port[0]) {
                        // Dynamo has already deleted this connection
                        port[0].silentRemove = true;
                    }

                    this.model.disconnectPort(i, null, false);
                }
            }

            ports = this.model.getPorts(true);
            len = ports.length;
            // need to delete connections from all output ports
            // that doesn't exist anymore
            for (i = len - 1; i >= 0; i--) {
                oldPort = ex.oldOutputs[i];
                newIndex = ex.outputs.indexOf(oldPort);
                // if this output port was deleted
                // and there are connectors from it
                if (newIndex == -1 && this.model.isPortConnected(i, true)) {
                    port = ports[i];
                    while (port.length) {
                        conn = port[0];
                        // Dynamo has already deleted this connection
                        conn.silentRemove = true;
                        this.model.disconnectPort(i, conn, true);
                        this.model.workspace.get('connections').remove(conn);
                    }
                }
            }
        },

        setInputConnections: function () {

            var inputConnections = this.model.get('inputConnections');
            // copy array of connections into separate array
            var inputsCopy = inputConnections.slice(0);
            var ex = this.model.get('extra');
            var i, j, index, port;
            var oldLength = ex.oldInputs.length,
                newLength = ex.inputs.length;

            for (i = 0; i < newLength; i++) {
                index = ex.oldInputs.indexOf(ex.inputs[i]);
                // if it's new added input port
                if (index == -1) {
                    inputConnections[i] = [];
                }
                else {
                    // if this input port has already been
                    // and it could change its index
                    port = inputsCopy[index];
                    inputConnections[i] = port;
                    if (port && i != index) {
                        for (j = 0; j < port.length; j++) {
                            port[j].set('endPortIndex', i);
                        }
                    }
                }
            }

            if (newLength < oldLength)
                inputConnections.remove(newLength, oldLength - 1);
        },

        setOutputConnections: function () {

            var outputConnections = this.model.get('outputConnections');
            // copy array of connections into separate array
            var outputsCopy = outputConnections.slice(0);
            var ex = this.model.get('extra');
            var i, j, index, port;
            var oldLength = ex.oldOutputs.length,
                newLength = ex.outputs.length;

            for (i = 0; i < newLength; i++) {
                index = ex.oldOutputs.indexOf(ex.outputs[i]);
                // if it's new added output port
                if (index == -1) {
                    outputConnections[i] = [];
                }
                else {
                    // if this output port has already been
                    // and it could change its index
                    port = outputsCopy[index];
                    outputConnections[i] = port;
                    if (port && i != index) {
                        for (j = 0; j < port.length; j++) {
                            port[j].set('startPortIndex', i);
                        }
                    }
                }
            }

            if (newLength < oldLength)
                outputConnections.remove(newLength, oldLength - 1);
        },

        setInputsProperty: function (inputs) {
            if (inputs === undefined) return;

            var ex = this.model.get('extra');
            var exCopy = JSON.parse(JSON.stringify(ex));

            exCopy.inputs = inputs;
            this.model.workspace.setNodeProperty({property: 'extra', _id: this.model.get('_id'), newValue: exCopy, oldValue: ex });
        },

        setOutputsProperty: function (outputs) {
            if (outputs === undefined) return;

            var ex = this.model.get('extra');
            var exCopy = JSON.parse(JSON.stringify(ex));

            exCopy.outputs = outputs;
            this.model.workspace.setNodeProperty({property: 'extra', _id: this.model.get('_id'), newValue: exCopy, oldValue: ex });
        },

        renderNode: function () {

            var del = { show: 400 },
                that = this,
                ex,
                i = 0,
                len,
                index = 0,
                margintop,
                port;

            BaseNodeView.prototype.renderNode.apply(this, arguments);

            this.input = this.$el.find('.code-block-input');

            this.input.height( this.input[0].scrollHeight );

            this.input.focus(function (e) {
                that.selectable = false;
                that.model.set('selected', false);
                e.stopPropagation();
            });

            this.input.blur(function () {

                var ex = JSON.parse(JSON.stringify(that.model.get('extra')));

                if (!that.input.val()) {
                    that.selectable = true;
                    that.model.workspace.removeNodeById(that.model.get('_id'));
                    return;
                }

                if (ex.code === that.input.val())
                    return;

                ex.code = that.input.val();

                that.model.workspace.setNodeProperty({property: 'extra', _id: that.model.get('_id'), newValue: ex });
                that.selectable = true;
            });

            ex = this.model.get('extra') || {};
            if (ex.outputs) {
                this.$el.find('.node-port-output').tooltip('destroy');
                len = ex.outputs.length;

                for (; i < len; i++) {
                    port = this.$el.find('.node-port-output[data-index=\' ' + i + ' \']');
                    port.tooltip({
                        title: ex.outputs[i],
                        placement: "right",
                        delay: del
                    });

                    if(ex.lineIndices) {
                        index = i > 0 ? ex.lineIndices[i] - ex.lineIndices[i - 1] - 1 : ex.lineIndices[i];
                        margintop = index * 25;
                        port.css("margin-top", margintop);
                        if (i > 0) {
                            port = this.$el.find(".node-port-output[data-index=' " + (i - 1) + " ']");
                            if (margintop)
                                port.addClass('need-bottom');
                            else
                                port.removeClass('need-bottom');
                        }
                    }
                }
            }

            this.input.focus();

            return this;
        },

        render: function () {

            BaseNodeView.prototype.render.apply(this, arguments);

            return this;

        }

    });

});