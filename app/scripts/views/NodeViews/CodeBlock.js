define(['backbone', 'BaseNodeView'], function (Backbone, BaseNodeView) {

    return BaseNodeView.extend({

        innerTemplate: _.template($('#code-block-template').html()),

        initialize: function (args) {

            BaseNodeView.prototype.initialize.apply(this, arguments);
            this.model.on('change:extra', this.onChangedExtra, this);
            this.model.on('connections-update', this.onConnectionsUpdate, this);
        },

        getCustomContents: function () {

            var json = this.model.toJSON();
            if (!json.extra.code) json.extra.code = this.model.get('type').code;

            return this.innerTemplate(json);

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
                this.setNumInputConnections(ex.inputs.length);
                this.setInputsProperty(ex.inputs);
                this.model.get('type').setInputs(ex.inputs);
            }
            if (ex.outputs !== undefined) {
                this.setNumOutputConnections(ex.outputs.length);
                this.setOutputsProperty(ex.outputs);
                this.model.get('type').setOutputs(ex.outputs);
            }

            this.render();
            this.$el.removeClass('node-evaluating');
        },

        removeConnections: function (ex) {
            var i,
                len,
                conn,
                ports;

            ports = this.model.getPorts(false);
            len = ports.length;
            if (len > ex.inputs.length) {
                for (i = len - 1; i >= ex.inputs.length; i--) {
                    this.model.disconnectPort(i, null, false);
                }
            }

            ports = this.model.getPorts(true);
            len = ports.length;
            if (len > ex.outputs.length) {
                for (i = len - 1; i >= ex.outputs.length; i--) {
                    if (this.model.isPortConnected(i, true)) {
                        while (ports[i].length) {
                            conn = ports[i][0];
                            this.model.disconnectPort(i, conn, true);
                            this.model.workspace.get('connections').remove(conn);
                        }
                    }
                }
            }
        },

        setNumInputConnections: function (num) {

            if (num === undefined) return;

            var inputConns = this.model.get('inputConnections');

            var diff = num - inputConns.length;

            if (diff === 0) return;

            if (diff > 0) {
                for (var i = 0; i < diff; i++) {
                    inputConns.push([]);
                }
            } else {
                for (var i = 0; i < -diff; i++) {

                    var conn = this.model.getConnectionAtIndex(inputConns.length - 1);

                    if (conn != null) {
                        this.model.workspace.removeConnection(conn);
                    }

                    inputConns.pop();
                }
            }
        },

        setNumOutputConnections: function (num) {

            if (num === undefined) return;

            var outputConns = this.model.get('outputConnections');

            var diff = num - outputConns.length;

            if (diff === 0) return;

            if (diff > 0) {
                for (var i = 0; i < diff; i++) {
                    outputConns.push([]);
                }
            } else {
                for (var i = 0; i < -diff; i++) {

                    var conn = this.model.getConnectionAtIndex(outputConns.length - 1);

                    if (conn != null) {
                        this.model.workspace.removeConnection(conn);
                    }

                    outputConns.pop();
                }
            }
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
                index = 0;

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
                    this.$el.find('.node-port-output[data-index=\' ' + i + ' \']').tooltip({
                        title: ex.outputs[i],
                        placement: "right",
                        delay: del
                    });

                    if(ex.portIndexes) {
                      index = i > 0 ? ex.portIndexes[i] - ex.portIndexes[i - 1] - 1 : ex.portIndexes[i];
                      this.$el.find('.node-port-output[data-index=\' ' + i + ' \']').css("margin-top", index * 25);
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