/**
 * Created by Masha on 10/29/2014.
 */
define(['backbone', 'SaveFileMessage', 'SetModelPositionMessage', 'staticHelpers'],
    function(Backbone, SaveFileMessage, SetModelPositionMessage, helpers) {

    var data = null;

    function mapWorkspaceFromBrowserView(ws) {
        return {
            guid: ws.get('guid'),
            id: ws.get('_id')
        };
    }

    function prepareWorkspace(ws) {
        var app = this.appView.model;

        if (data.workspaceId) {
            ws.set('guid', data.workspaceId);
        }

        // if name is not empty
        if (data.workspaceName && data.workspaceName.trim().length) {
            ws.set('name', data.workspaceName);
            // if it's NWK tab name will be set to file name later
            ws.set('tabName', data.workspaceName);
        }

        var browserViewWorkspaces = this.appView.browserView.model.get('workspaces')
            .map(mapWorkspaceFromBrowserView);
        ws.createNodes(data, browserViewWorkspaces);
        app.changed.currentWorkspace = ws.get('_id');
        this.appView.render();
        ws.createConnections(data);

        ws.subscribeOnNodesConnectionsChanges();
        ws.runner.subscribeOnNodesConnectionsChanges();

        ws.get('nodes').each(function (x) {
            this.watchNodeEvents(x);
        }.bind(ws.runner));

        app.trigger('computation-completed:event', data);
        ws.trigger('runCommand');

        if (data.workspaceId) {
            this.setAvailableCustomNodeDefinitions(data.workspaceId);
        }

        this.appView.zoomresetClick();
    }

    return Backbone.View.extend({

        el: '#save-upload',

        events: {
            'click #saveas-file-button': 'saveFile',
            'change #openfile': 'loadSelectedFile'
        },

        initialize: function (attrs) {
            this.appView = attrs.appView;
            this.proxyNodesDependencies = [];
            this.availableCustomNodeDefinitions = [];

            this.listenTo( this.appView.model, 'creation-data-received:event', this.createWorkspaceWithData);
            this.listenTo( this.appView.model, 'saved-file-received:event', this.downloadFile);
            // when we upload a custom node definition we should make all its instances not proxy anymore
            this.listenTo( this.appView.model, 'proxy-nodes-data-received:event', this.setProxyNodesDependenciesData);

            this.configViewElements();
        },

        configViewElements: function() {
            this.$el.addClass('no-save-button');
            this.$el.find('#savefile').hide();
            this.$el.find('#saveas-file-button div').removeClass('over-hidden-file-input');
        },

        getCurrentWorkspaceGuid: function () {
            var ws = this.appView.model.getCurrentWorkspace(),
                guid = ws.get('isCustomNode') ? ws.get('guid') : '';

            return guid;
        },

        synchronizeNodeCoordinates: function () {
            var nodes = this.appView.model.getCurrentWorkspace().get('nodes'),
                guid = this.getCurrentWorkspaceGuid(),
                wsName = this.appView.model.getCurrentWorkspace().get('name'),
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
            this.appView.model.socket.send(JSON.stringify(message));
        },

        loadSelectedFile: function (e) {
            var files = e.target.files;
            if (files && files.length == 1) {
                this.appView.model.socket.send(files[0]);

                e.target.value = null;
            }
        },

        downloadFile: function (param) {
            var byteArray = helpers.getByteArray(param.fileContent);

            var blob = new Blob([byteArray], { type : 'application/octet-stream' });
            var url = window.URL || window.webkitURL;
            var downloadUrl = url.createObjectURL(blob);
            var downloadElement = document.createElement('a');
            downloadElement.style = 'display: none;';
            downloadElement.href = downloadUrl;
            downloadElement.download = param.fileName;
            downloadElement.click();
        },

        createWorkspaceWithData: function (params) {
            var i, app = this.appView.model;
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
            if (params.workspaceId) {
                workspaces = allWorkspaces.where({ guid: params.workspaceId });
            }
            else {
                workspaces = allWorkspaces.where({ isCustomNode: false });
            }

            if (workspaces.length > 0) {
                var currentWorkspace = workspaces[0];
                app.set('currentWorkspace', currentWorkspace.get('_id'));

                prepareWorkspace.call(this, currentWorkspace);
            }
            else if (params.workspaceId) {
                workspaces = this.appView.browserView.model.get('workspaces').where({ guid: params.workspaceId });
                if (workspaces.length > 0) {
                    app.loadWorkspace(workspaces[0].get('_id'), prepareWorkspace.bind(this), true, true);
                }
                else {
                    app.newNodeWorkspace(prepareWorkspace.bind(this), true);
                }
            }
            else {
                app.newWorkspace(prepareWorkspace.bind(this));
            }
        },

        setProxyNodesDependenciesData: function (data) {
            if (this.proxyNodesDependencies.indexOf(data) == -1) {
                this.proxyNodesDependencies.push(data);
            }

            if (this.availableCustomNodeDefinitions.indexOf(data.customNodeId) > -1) {
                this.updateDependenciesAndNodes(data);
            }
        },

        setAvailableCustomNodeDefinitions: function(guid) {
            if (this.availableCustomNodeDefinitions.indexOf(guid) == -1) {
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
            var allWorkspaces = this.appView.model.get('workspaces');
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

                        if (customNodeId && workspace.get('workspaceDependencyIds').indexOf(customNodeId) == -1) {
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
