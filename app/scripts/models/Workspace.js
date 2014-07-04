define(['backbone', 'Nodes', 'Connection', 'Connections', 'Runner', 'Node', 'Marquee', 'NodesFactory'],
    function (Backbone, Nodes, Connection, Connections, Runner, Node, Marquee, nodesFactory) {

        return Backbone.Model.extend({

            idAttribute: "_id",

            url: function () {
                return '/ws/' + this.get('_id');
            },

            defaults: {
                name: "Unnamed Workspace",
                nodes: null,
                connections: null,
                zoom: 1,
                current: false,
                isPublic: false,
                isRunning: false,
                lastSaved: Date.now(),
                offset: [20000, 20000],

                // undo/redo stack
                undoStack: [],
                redoStack: [],
                clipBoard: []
            },

            // connection creation
            draggingProxy: false,
            proxyConnection: null,

            // marquee selection
            dragSelect: false,


            runAllowed: false,

            initialize: function (atts, arr) {

                atts = atts || {};

                this.app = arr.app;

                this.set('nodes', new Nodes());
                for(var i = 0; i < atts.nodes.length; i++) {
                    this.get('nodes').add(nodesFactory.create({
                        config: atts.nodes[i],
                        workspace: this }))
                }

                this.set('connections', new Connections(atts.connections, { workspace: this }));

                // tell all nodes about connections
                _.each(this.get('connections').where({ startProxy: false, endProxy: false }), function (ele) {
                    this.get('nodes').get(ele.get('startNodeId')).connectPort(ele.get('startPortIndex'), true, ele);
                    this.get('nodes').get(ele.get('endNodeId')).connectPort(ele.get('endPortIndex'), false, ele);
                }, this);

                this.runner = new Runner({ id: this.get('_id') }, { workspace: this });

                // updates to connections and nodes are emitted to listeners
                var that = this;
                this.runner.on('change:isRunning', function (v) {
                    that.set('isRunning', v.get('isRunning'));
                });

                this.get('connections').on('add remove', function () {
                    that.trigger('change:connections');
                    that.run();
                });

                this.get('nodes').on('add remove', function () {
                    that.trigger('change:nodes');
                    that.run();
                });

                // the proxy connection is what is drawn when the user is 
                // in the process of creating a new connection - it is not 
                // persisted.
                this.proxyConnection = new Connection({
                    _id: -1,
                    startProxy: true,
                    endProxy: true,
                    startProxyPosition: [0, 0],
                    endProxyPosition: [0, 0],
                    hidden: true
                }, { workspace: this });

                this.marquee = new Marquee({
                    _id: -1,
                    hidden: true
                }, { workspace: this });

                this.runAllowed = true;

                // run the workspace for the first time
                this.run();

                // save on every change
                var throttledSync = _.throttle(function () { this.sync('update', this); }, 2000);
                this.on('runCommand', throttledSync, this);
                this.on('change:name', throttledSync, this);

                Backbone.on('computation-completed:event', this.updateNodesValues, this);
            },

            toJSON: function () {

                this.set('undoStack', _.last(this.get('undoStack'), 10));
                this.set('redoStack', _.last(this.get('redoStack'), 10));

                if (this._isSerializing) {
                    return this.id || this.cid;
                }

                this._isSerializing = true;

                var json = _.clone(this.attributes);

                _.each(json, function (value, name) {
                    _.isFunction(value.toJSON) && (json[name] = value.toJSON());
                });

                this._isSerializing = false;

                return json;
            },

            zoomIn: function () {

                if (this.get('zoom') > 4) {
                    return;
                }

                this.set('zoom', this.get('zoom') + 0.05);

            },

            zoomOut: function () {

                if (this.get('zoom') < 0.2) {
                    return;
                }

                this.set('zoom', this.get('zoom') - 0.05);

            },

            parse: function (resp) {
                resp.nodes = new Nodes(resp.nodes);
                resp.connections = new Connections(resp.connections);
                return resp;
            },

            printModel: function () {
                console.log(this.toJSON());
            },

            addToUndoAndClearRedo: function (cmd) {

                this.get('undoStack').push(cmd);
                this.get('redoStack').length = 0;

            },

            removeSelected: function () {

                // get all selected nodes
                var nodeFound = false;
                var nodesToRemove = {};
                this.get('nodes')
                    .each(function (x) {
                        if (x.get('selected')) {
                            nodeFound = true;
                            nodesToRemove[x.get('_id')] = x.serialize();
                        }
                    });

                if (!nodeFound) return;

                // get all relevant connections
                var connsToRemove = {};
                this.get('connections')
                  .each(function (x) {
                      if (nodesToRemove[x.get('startNodeId')] || nodesToRemove[x.get('endNodeId')]) {
                          if (!connsToRemove[x.get('_id')]) {
                              connsToRemove[x.get('_id')] = x.toJSON();
                          }
                      }
                  });

                // construct composite command
                var multipleCmd = { kind: "multiple", commands: [] };

                // first remove all connections
                for (var connId in connsToRemove) {
                    var connToRemove = connsToRemove[connId];
                    connToRemove.kind = "removeConnection";
                    multipleCmd.commands.push(connToRemove);
                }

                // then remove all nodes
                for (var nodeId in nodesToRemove) {
                    var nodeToRemove = nodesToRemove[nodeId];
                    nodeToRemove.kind = "removeNode";
                    multipleCmd.commands.push(nodeToRemove);
                }

                this.runInternalCommand(multipleCmd);
                this.addToUndoAndClearRedo(multipleCmd);

            },

            makeId: function () {
                return this.app.makeId();
            },

            copy: function () {

                // get all selected nodes
                var nodeFound = false;
                var copyNodes = {};
                this.get('nodes')
                    .each(function (x) {
                        if (x.get('selected')) {
                            nodeFound = true;
                            copyNodes[x.get('_id')] = x.serialize();
                        }
                    });

                // TODO: clear the clipboard!
                if (!nodeFound) return;

                // get all relevant connections
                var copyConns = {};
                var connCount = 0;
                this.get('connections')
                  .each(function (x) {

                      if (x.get('_id') === -1 || x.get('startProxy') || x.get('endProxy')) return;

                      if ((copyNodes[x.get('startNodeId')] && copyNodes[x.get('endNodeId')]) || copyNodes[x.get('endNodeId')]) {

                          if (!copyConns[x.get('_id')]) {
                              connCount++;
                              copyConns[x.get('_id')] = x.toJSON();
                          }
                      }
                  });

                console.log(connCount, " connections copied");

                this.app.set('clipboard', { nodes: copyNodes, connections: copyConns });

            },

            paste: function () {

                // build the command
                var cb = JSON.parse(JSON.stringify(this.app.get('clipboard'))),
                    that = this,
                    nodes = {},
                    nodeOffset = Math.min(20, Math.abs(80 * Math.random())),
                    nodeCount = 0;

                _.each(cb.nodes, function (x) {

                    // give new id for building the paste
                    nodes[x._id] = x;
                    nodes[x._id].position = [x.position[0] + nodeOffset, x.position[1] + nodeOffset];
                    nodes[x._id]._id = that.makeId();
                    nodeCount++;

                });

                if (nodeCount > 0) this.get('nodes').deselectAll();

                var connections = {};

                _.each(cb.connections, function (x) {

                    if (nodes[x.endNodeId]) {
                        x.endNodeId = nodes[x.endNodeId]._id;
                    }

                    if (nodes[x.startNodeId]) {
                        x.startNodeId = nodes[x.startNodeId]._id;
                    }

                    connections[x._id] = x;
                    connections[x._id]._id = that.makeId();

                });

                // build the command
                var multipleCmd = { kind: "multiple", commands: [] },
                    id,
                    cpNode,
                    cpConn;

                // build all of the nodes
                for (id in nodes) {
                    cpNode = cb.nodes[id];
                    cpNode.kind = "addNode";
                    multipleCmd.commands.push(cpNode);
                }

                // then builds the connections
                for (id in connections) {
                    cpConn = connections[id];
                    cpConn.kind = "addConnection";
                    multipleCmd.commands.push(cpConn);
                }

                this.runInternalCommand(multipleCmd);
                this.addToUndoAndClearRedo(multipleCmd);

            },

            addNodeByNameAndPosition: function (name, position) {

                if (name === undefined || position === undefined) return;
                this.addNode({ typeName: name, position: position, _id: this.makeId() });

            },

            addNode: function (data) {

                var datac = JSON.parse(JSON.stringify(data));
                datac.kind = "addNode";
                this.runInternalCommand(datac);
                this.addToUndoAndClearRedo(datac);

            },

            removeNode: function (data) {

                var datac = JSON.parse(JSON.stringify(data));
                datac.kind = "removeNode";
                this.runInternalCommand(datac);
                this.addToUndoAndClearRedo(datac);

            },

            addConnection: function (data) {

                var datac = JSON.parse(JSON.stringify(data));
                datac.kind = "addConnection";
                this.runInternalCommand(datac);
                this.addToUndoAndClearRedo(datac);

            },

            addConnectionAndRemoveExisting: function (startNodeId, startPort, endNodeId, endPort) {

                var multiCmd = { kind: "multiple", commands: [] };

                // remove any existing connection
                var endNode = this.get('nodes').get(endNodeId);
                if (!endNode) return this;
                var existingConnection = endNode.getConnectionAtIndex(endPort);

                if (existingConnection) {
                    var rmConn = existingConnection.toJSON();
                    rmConn.kind = "removeConnection";
                    multiCmd.commands.push(rmConn);
                }

                var newConn = {
                    kind: "addConnection",
                    startNodeId: startNodeId,
                    startPortIndex: startPort,
                    endNodeId: endNodeId,
                    endPortIndex: endPort,
                    _id: this.app.makeId()
                };

                multiCmd.commands.push(newConn);

                this.runInternalCommand(multiCmd);
                this.addToUndoAndClearRedo(multiCmd);

                return this;
            },

            removeConnection: function (data) {

                var datac = JSON.parse(JSON.stringify(data));
                datac.kind = "removeConnection";
                this.runInternalCommand(datac);
                this.addToUndoAndClearRedo(datac);

            },

            setNodeProperty: function (data) {

                var datac = JSON.parse(JSON.stringify(data));
                datac.kind = "setNodeProperty";
                this.runInternalCommand(datac);
                this.addToUndoAndClearRedo(datac);

            },

            internalCommands: {

                multiple: function (data) {

                    // we prevent runs until all of the changes have been committed
                    var previousRunAllowedState = this.runAllowed;
                    this.runAllowed = false;

                    // run all of the commands
                    var that = this;
                    data.commands.forEach(function (x) {
                        that.runInternalCommand.call(that, x);
                    });

                    // restore previous runAllowed state and, if necessary, do run
                    this.runAllowed = previousRunAllowedState;
                    if (this.runRejected) this.run();

                },

                addNode: function (data) {
                    this.get('nodes').add(nodesFactory.create({
                        config: data,
                        workspace: this }));
                },

                removeNode: function (data) {

                    var node = this.get('nodes').get(data._id);
                    this.get('nodes').remove(node);

                },

                addConnection: function (data) {

                    var nodes = this.get('nodes');
                    if (!nodes.get(data.startNodeId) || !nodes.get(data.endNodeId)) return;

                    var conn = new Connection(data, { workspace: this });
                    this.get('connections').add(conn);
                    this.get('nodes').get(conn.get('startNodeId')).connectPort(conn.get('startPortIndex'), true, conn);
                    this.get('nodes').get(conn.get('endNodeId')).connectPort(conn.get('endPortIndex'), false, conn);

                },

                removeConnection: function (data) {

                    var conn = this.get('connections').get(data._id);
                    if (conn) this.get('connections').remove(conn);

                },

                setNodeProperty: function (data) {

                    var node = this.get('nodes').get(data._id);
                    var prop = data.property;
                    if (!data.oldValue) data.oldValue = JSON.parse(JSON.stringify(node.get(prop)));

                    node.set(prop, data.newValue);

                }

            },

            runInternalCommand: function (commandData) {

                var cmd = this.internalCommands[commandData.kind];
                if (cmd) {
                    cmd.call(this, commandData);
                    this.trigger('runCommand');
                    return;
                }

                console.warn('Could not find the command: ' + cmd.kind);

            },

            redo: function () {

                var rs = this.get('redoStack');

                if (rs.length === 0) {
                    return console.warn("Nothing to redo!");
                }

                var data = rs.pop();
                this.get('undoStack').push(data);
                this.runInternalCommand(data);

            },

            undo: function () {

                var us = this.get('undoStack');
                if (us.length === 0) {
                    return;
                }

                var command = us.pop();
                var undoCommand = this.invertCommand(command);
                this.get('redoStack').push(command);

                this.runInternalCommand(undoCommand);

            },

            invertCommand: function (cmd) {

                var inverter = this.commandInversions[cmd.kind];
                if (inverter) {
                    return inverter.call(this, cmd);
                }

                return {};

            },

            commandInversions: {

                addNode: function (cmd) {

                    var cmdcop = JSON.parse(JSON.stringify(cmd));
                    cmdcop.kind = "removeNode";
                    return cmdcop;

                },

                multiple: function (cmd) {

                    var cmdcop = JSON.parse(JSON.stringify(cmd));

                    var that = this;
                    cmdcop.commands = cmdcop.commands.map(function (x) {
                        return that.invertCommand.call(that, x);
                    });
                    cmdcop.commands.reverse();

                    return cmdcop;

                },

                removeNode: function (cmd) {

                    var cmdcop = JSON.parse(JSON.stringify(cmd));
                    cmdcop.kind = "addNode";
                    return cmdcop;

                },

                addConnection: function (cmd) {

                    var cmdcop = JSON.parse(JSON.stringify(cmd));
                    cmdcop.kind = "removeConnection";
                    return cmdcop;

                },

                removeConnection: function (cmd) {

                    var cmdcop = JSON.parse(JSON.stringify(cmd));
                    cmdcop.kind = "addConnection";
                    return cmdcop;

                },

                setNodeProperty: function (cmd) {

                    var cmdcop = JSON.parse(JSON.stringify(cmd));

                    var temp = cmdcop.oldValue;
                    cmdcop.oldValue = cmdcop.newValue;
                    cmdcop.newValue = temp;
                    return cmdcop;

                }

            },

            run: function () {

                if (!this.runAllowed) {
                    this.runRejected = true;
                    return;
                }

                this.runReject = false;

                if (this.get('nodes').length === 0) {
                    return;
                }

                var bottomNodes = this.get('nodes')
                                      .filter(function (ele) {
                                          return ele.isOutputNode();
                                      }).map(function (ele) {
                                          return ele.get('_id');
                                      });

                this.runner.run(bottomNodes);

            },

            startMarqueeSelect: function (startPosition) {

                this.set('marqueeStart', startPosition);
                this.set('marqueeEnd', startPosition);
                this.set('marqueeSelectEnabled', true);

                return this;
            },

            endMarqueeSelect: function () {

                this.set('marqueeSelectEnabled', false);

                return this;
            },

            startProxyConnection: function (startNodeId, nodePort, startPosition) {

                // Note: this is a quick fix for when the proxy connection
                this.set('proxyStartId', startNodeId);
                this.set('proxyStartPortIndex', nodePort);

                // set the initial properties for a dragging proxy
                this.proxyConnection.set('hidden', false);
                this.proxyConnection.set('startNodeId', startNodeId);

                this.proxyConnection.set('startPortIndex', nodePort);

                this.proxyConnection.set('startProxy', false);

                this.proxyConnection.set('endProxy', true);
                this.proxyConnection.set('endProxyPosition', startPosition);

                this.draggingProxy = true;

                this.trigger('startProxyDrag');
                return this;
            },

            completeProxyConnection: function (endNodeId, endPortIndex) {

                this.draggingProxy = false;
                this.trigger('endProxyDrag');

                var startNodeId = this.proxyConnection.get('startNodeId')
                  , startPortIndex = this.proxyConnection.get('startPortIndex');

                this.addConnectionAndRemoveExisting(startNodeId, startPortIndex, endNodeId, endPortIndex);

                return this;
            },

            endProxyConnection: function () {

                this.proxyConnection.set('hidden', true);
                this.draggingProxy = false;
                return this;

            },

            updateNodesValues: function (param) {
                var i = 0,
                    len = param.result.length,
                    node,
                    resultNode;

                for (; i < len; i++) {
                    resultNode = param.result[i];
                    node = this.app.getCurrentWorkspace().get('nodes').get(param.result[i].nodeID);
                    node.updateValue(param.result[i]);
                }
            }
        });

    });



