/**
 * Created by Masha on 11/26/2014.
 */
define(['backbone', 'SaveFileMessage', 'SetModelPositionMessage',
        'ClearWorkspaceMessage', 'staticHelpers', 'FileSaver'],
    function(Backbone, SaveFileMessage, SetModelPositionMessage,
             ClearWorkspaceMessage, helpers, FileSaver) {

        var data = null;

        function mapWorkspaceFromBrowserView(ws) {
            return {
                guid: ws.get('guid'),
                id: ws.get('_id')
            };
        }

        function prepareWorkspace(ws) {
            var app = this.app;

            if (data.workspaceId) {
                ws.set('guid', data.workspaceId);
            }

            // if name is not empty
            if (data.workspaceName && data.workspaceName.trim().length) {
                ws.set('name', data.workspaceName);
                // if it's NWK tab name will be set to file name later
                ws.set('tabName', data.workspaceName);
            }

            var browserWorkspaces = app.workspaceBrowser ? app.workspaceBrowser.get('workspaces')
                .map(mapWorkspaceFromBrowserView) : [];
            ws.createNodes(data, browserWorkspaces);
            app.changed.currentWorkspace = ws.get('_id');
            app.trigger('change');
            ws.createConnections(data);

            ws.subscribeOnNodesConnectionsChanges();
            ws.runner.subscribeOnNodesConnectionsChanges();

            ws.get('nodes').each(function (x) {
                this.watchNodeEvents(x);
            }.bind(ws.runner));

            if (ws.get('isCustomNode')) {
                ws.initializeCustomNode();
            }

            app.trigger('computation-completed:event', data);
            
            if (data.workspaceId) {
                this.setAvailableCustomNodeDefinitions(data.workspaceId);
            }

            if (ws.get('nodes').length)
                app.trigger('ws-data-loaded');

            // make the loaded ws appear in workspace browser
            app.trigger('request-workspace-browser-refresh');
        }

        return Backbone.Model.extend({

            initialize: function (attrs) {
                this.app = attrs.app;
                this.proxyNodesDependencies = [];
                this.availableCustomNodeDefinitions = [];

                this.listenTo( this.app, 'replace-old-home', this.replaceOldHome);
                this.listenTo( this.app, 'creation-data-received:event', this.createWorkspaceWithData);
                this.listenTo( this.app, 'saved-file-received:event', this.downloadFile);
                // when we upload a custom node definition we should make all its instances not proxy anymore
                this.listenTo( this.app, 'proxy-nodes-data-received:event', this.setProxyNodesDependenciesData);
            },

            clearHomeWorkspace: function () {
                var home = this.getHomeWorkspace();
                var setName = function (ws) {
                    ws.set('name', 'Home');
                    ws.set('tabName', 'Home');
                };

                this.sendStringMessage(new ClearWorkspaceMessage(true));

                if (home) {
                    // remove current home ws and add new one
                    // to keep current one in Mongo
                    this.app.get('workspaces').remove(home);
                }

                this.app.newWorkspace(setName);
            },

            replaceOldHome: function () {
                this.sendStringMessage(new ClearWorkspaceMessage(true));
            },

            getHomeWorkspace: function () {
                return this.getWorkspaceByGuid();
            },

            getWorkspaceByGuid: function(guid) {
                var allWorkspaces = this.app.get('workspaces');
                var workspaces = guid ? allWorkspaces.where({ guid: guid }) :
                    allWorkspaces.where({ isCustomNode: false });
                if (workspaces.length) {
                    return workspaces[0];
                }

                return null;
            },

            getCurrentWorkspaceGuid: function () {
                var ws = this.app.getCurrentWorkspace(),
                    guid = ws.get('isCustomNode') ? ws.get('guid') : '';

                return guid;
            },

            synchronizeNodeCoordinates: function () {
                var nodes = this.app.getCurrentWorkspace().get('nodes'),
                    guid = this.getCurrentWorkspaceGuid(),
                    wsName = this.app.getCurrentWorkspace().get('name'),
                    nodePositions = [];

                nodes.each(function (node) {
                    nodePositions.push({
                        modelId: node.get('_id'),
                        x: node.get('position')[0],
                        y: node.get('position')[1]
                    });
                });

                this.sendStringMessage(new SetModelPositionMessage(nodePositions, guid, wsName));
            },

            saveFile: function () {
                this.synchronizeNodeCoordinates();
                var guid = this.getCurrentWorkspaceGuid();
                this.sendStringMessage(new SaveFileMessage(guid));
            },

            sendStringMessage: function (message) {
                this.app.socket.send(JSON.stringify(message));
            },

            downloadFile: function (param) {
                var byteArray = helpers.getByteArray(param.fileContent);

                var blob = new Blob([byteArray], { type : 'application/octet-stream' });
                FileSaver( blob, param.fileName );
            },

            createWorkspaceWithData: function (params) {
                var i, app = this.app;
                data = params;
                for (i = 0; i < params.nodes.length; i++) {
                    var node = params.nodes[i];
                    node.typeName = node.creationName;
                }

                for (i = 0; i < params.connections.length; i++) {
                    params.connections[i]._id = app.makeId();
                }

                var workspaces;
                var allWorkspaces = app.get('workspaces');
                var isCustomNode = !!params.workspaceId;
                if (isCustomNode) {
                    workspaces = allWorkspaces.where({ guid: params.workspaceId });
                }
                else {
                    workspaces = allWorkspaces.where({ isCustomNode: false });
                }

                if (workspaces.length) {
                    var currentWorkspace = workspaces[0];
                    if (isCustomNode) {
                        app.set('currentWorkspace', currentWorkspace.get('_id'));
                        prepareWorkspace.call(this, currentWorkspace);
                    }
                    else {
                        // remove current ws and add new one
                        // to keep current one in Mongo.
                        // Don't do this way with custom node ws
                        // to avoid a mess with dependencies
                        allWorkspaces.remove(currentWorkspace);
                        app.newWorkspace(prepareWorkspace.bind(this));
                    }
                }
                else if (isCustomNode) {
                    workspaces = this.app.workspaceBrowser ? this.app.workspaceBrowser
                        .get('workspaces').where({ guid: params.workspaceId }) : [];
                    if (workspaces.length) {
                        app.openWorkspace(workspaces[0].get('_id'), prepareWorkspace.bind(this), true);
                    }
                    else {
                        app.newNodeWorkspace(prepareWorkspace.bind(this), null, true);
                    }
                }
                else {
                    app.newWorkspace(prepareWorkspace.bind(this));
                }
            },

            setProxyNodesDependenciesData: function (data) {
                if (this.proxyNodesDependencies.indexOf(data) === -1) {
                    this.proxyNodesDependencies.push(data);
                }

                if (this.availableCustomNodeDefinitions.indexOf(data.customNodeId) > -1) {
                    this.updateDependenciesAndNodes(data);
                }
            },

            setAvailableCustomNodeDefinitions: function(guid) {
                if (this.availableCustomNodeDefinitions.indexOf(guid) === -1) {
                    this.availableCustomNodeDefinitions.push(guid);
                }

                var data = this.proxyNodesDependencies.filter(function (element) {
                    return element.customNodeId === guid;
                });

                if (data.length) {
                    this.updateDependenciesAndNodes(data[0]);
                }
            },

            updateDependenciesAndNodes: function(data) {
                var allWorkspaces = this.app.get('workspaces');
                // get workspace that contains proxy instances
                var workspaces = data.workspaceId ? allWorkspaces.where({ guid: data.workspaceId }) :
                    allWorkspaces.where({ isCustomNode: false });
                // get workspace-custom node definition, we need its id to set dependency
                var customNode = allWorkspaces.where({ guid: data.customNodeId });
                var customNodeId;

                if (workspaces.length > 0 && customNode.length > 0) {
                    var workspace = workspaces[0];
                    customNodeId = customNode[0].get('_id');

                    for (var i = 0; i < data.nodesIds.length; i++) {
                        var nodes = workspace.get('nodes').where({ _id: data.nodesIds[i] });
                        if (nodes.length) {
                            var node = nodes[0];

                            if (node.get('extra')) {
                                node.get('extra').isProxy = false;
                            }

                            node.set('isProxy', false);

                            if (customNodeId && workspace.get('workspaceDependencyIds').indexOf(customNodeId) === -1) {
                                node.get('extra').functionId = customNodeId;
                                workspace.addWorkspaceDependency(customNodeId);
                            }
                        }
                    }
                }

                var index = this.availableCustomNodeDefinitions.indexOf(data.customNodeId);
                this.availableCustomNodeDefinitions.remove(index, index);

                index = this.proxyNodesDependencies.indexOf(data);
                this.proxyNodesDependencies.remove(index, index);
            }

        });
    });
