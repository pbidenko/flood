define(['backbone', 'ThreeCSGNodeView'], function (Backbone, ThreeCSGNodeView) {

    var CodeBlock = ThreeCSGNodeView.extend({

        innerTemplate: _.template($('#code-block-template').html()),

        initialize: function (args) {

            ThreeCSGNodeView.prototype.initialize.apply(this, arguments);
            this.model.on('change:extra', this.onChangedExtra, this);
            this.model.on('connections-update', this.onConnectionsUpdate, this);
            this.model.on('cbn-up-to-date', this.finishEvaluating, this);

            //Get original element's size right after rendering of template
            this.once('after-render', function () {
                var $textEl = this.$el.find('code');
                $textEl.data('x', $textEl.outerWidth());
                $textEl.data('y', $textEl.outerHeight());
            }.bind(this));

            this.$el.on('mouseup', adjustElements.bind(this));
            this.$el.on('mousemove', adjustElements.bind(this));

            // Get a value of the cancel option before it is set to avoid losing previous value
            var cancelOption = this.$el.draggable( 'option', 'cancel' );
            if(!cancelOption.match(/.code-block-input/i))
                this.$el.draggable( 'option', 'cancel', cancelOption + ',.code-block-input' );
            
        },

        getCustomContents: function () {

            var json = this.model.toJSON();

            return this.innerTemplate(json);

        },

        finishEvaluating: function () {
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
                    port = outputsCopy[index] || [];
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
            this.model.workspace.setNodeProperty({ property: 'extra', _id: this.model.get('_id'), newValue: exCopy, oldValue: ex });
        },

        setOutputsProperty: function (outputs) {
            if (outputs === undefined) return;

            var ex = this.model.get('extra');
            var exCopy = JSON.parse(JSON.stringify(ex));

            exCopy.outputs = outputs;
            this.model.workspace.setNodeProperty({ property: 'extra', _id: this.model.get('_id'), newValue: exCopy, oldValue: ex });
        },

        renderNode: function () {

            var del = { show: 400 },
                ex,
                i = 0,
                len,
                index = 0,
                margintop,
                port;

            ThreeCSGNodeView.prototype.renderNode.apply(this, arguments);

            this.input = this.$el.find('.code-block-input');

            this.input.focus(function (e) {
                this.selectable = false;
                this.model.set('selected', false);
                e.stopPropagation();
            }.bind(this));

            this.input.blur(function () {

                this.selectable = true;

                var ex = JSON.parse(JSON.stringify(this.model.get('extra')));

                if (!this.input[0].innerText) {
                    this.model.workspace.removeNodeById(this.model.get('_id'));
                    return;
                }

                if (ex.code === this.input[0].innerText)
                    return;

                ex.code = this.input[0].innerText;

                this.model.workspace.setNodeProperty({ property: 'extra', _id: this.model.get('_id'), newValue: ex });
            }.bind(this));

            this.input.keyup(function () {
                this.renderPorts();
                this.model.trigger('change:position');
            }.bind(this));

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

            var lock = ex.lock || false;
            this.lockInput = this.$el.find('.lock-input');
            this.lockInput.val( lock );
            this.lockInput.change( function(e){ this.lockChanged.call(this, e); e.stopPropagation(); }.bind(this));

            this.trigger('after-render');

            Prism.highlightAll();

            return this;
        },

        moveNode: function() {
            ThreeCSGNodeView.prototype.moveNode.apply(this, arguments);

            if(!this.input[0].innerText){
                this.input.focus();
            }

            return this;
        },

        lockChanged: function(e){
            var ex = JSON.parse(JSON.stringify(this.model.get('extra')));

            ex.lock = this.lockInput.is(':checked');

            this.model.workspace.setNodeProperty({ property: 'extra', _id: this.model.get('_id'), newValue: ex });
        }
    });

    //Private methods
    var adjustElements = function () {
        var $textEl = this.$el.find('code');
        if ($textEl.outerWidth() !== $textEl.data('x') || $textEl.outerHeight() !== $textEl.data('y')) {
            this.renderPorts();
            this.model.workspace.trigger('update-connections');
            // store new height/width
            $textEl.data('x', $textEl.outerWidth());
            $textEl.data('y', $textEl.outerHeight());
        }
    };

    return CodeBlock;

});