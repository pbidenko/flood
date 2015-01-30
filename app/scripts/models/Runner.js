define(['backbone'], function (Backbone) {

    return Backbone.Model.extend({

        defaults: {
            isRunning: false
        },

        initialize: function (atts, vals) {

            this.app = vals.app;
            var ws = vals.workspace;
            this.workspace = ws;

            this.set('id', ws.get('_id'));

            this.reset();

            this.subscribeOnNodesConnectionsChanges();

            this.runCount = 0;
            this.averageRunTime = 0;

        },

        subscribeOnNodesConnectionsChanges: function(){

            this.listenTo(this.workspace.get('connections'), 'add', this.addConnection);
            this.listenTo(this.workspace.get('connections'), 'remove', this.removeConnection);

            this.listenTo(this.workspace.get('nodes'), 'add', this.addNode);
            this.listenTo(this.workspace.get('nodes'), 'remove', this.removeNode);
            this.listenTo(this.workspace.get('nodes'), 'addInPort', this.addInPort);
            this.listenTo(this.workspace.get('nodes'), 'removeInPort', this.removeInPort);

        },

        postMessage: function(data, quiet) {
            this.trigger('post', data);
        },

        post: function (data, quiet) {

            data.workspace_id = this.workspace.get('_id');
            this.postMessage(data, quiet);

        },

        initWorkspace: function () {

            this.post({ kind: 'addWorkspace' });

            var wsc = this.workspace.toJSON();

            var that = this;
            this.workspace.get('nodes').each(function (x) {
                that.watchNodeEvents.call(that, x);
            });

            wsc.kind = "setWorkspaceContents";
            this.post(wsc);
        },

        on_nodeEvalComplete: function (data) {

            var node = this.workspace.get('nodes').get(data._id);
            if (node)
                node.onEvalComplete(data.isNew, data.value, data.geometry);

        },

        on_nodeEvalFailed: function (data) {

            var node = this.workspace.get('nodes').get(data._id);
            if (node)
                this.workspace.get('nodes').get(data._id).onEvalFailed(data.exception);
        },

        on_nodeEvalBegin: function (data) {

            var node = this.workspace.get('nodes').get(data._id);
            if (node)
                this.workspace.get('nodes').get(data._id).onEvalBegin(data.isNew);

        },

        on_run: function (data) {

            console.log(data);
            this.set('isRunning', false);
            this.runCount++;

            this.trigger('runComplete');

        },

        cancel: function(){

            this.set('isRunning', false);
            this.worker.terminate();
            this.reset();

        },

        runQueued: false,

        run: _.throttle(function (bottomIds) {

            this.post({ kind: "run", bottom_ids: bottomIds });
            this.set('isRunning', true);

        }, 120),

        watchNodeEvents: function (node) {

            var update = function () {
                this.updateNode(node);
            };

            this.listenTo(node, 'change:replication change:ignoreDefaults updateRunner', update);
        },

		updateNode: function( node ){

			var n = node.serialize();

			n.kind = "updateNode";
			n.workspace_id = node.workspace.id;

			this.post( n );

		},

		addNode: function(node){

			var n = node.serialize();
			n.kind = "addNode";
			n.workspace_id = node.workspace.id;

			this.watchNodeEvents( node );

			this.post(n);

		},

		removeNode: function(node){

			var n = node.serialize();
			n.kind = "removeNode";
			n.workspace_id = node.workspace.id;

			this.post( n );

		},

		addInPort: function(node){

			var data = { kind: 'modelEvent', 
						_id: node.get('_id'),
						eventName: 'AddInPort'
			};

			this.post( data );

		},

		removeInPort: function(node){

			var data = { kind: 'modelEvent', 
						_id: node.get('_id'),
						eventName: 'RemoveInPort'
			};

			this.post( data );

		},

		addConnection: function(connection, workspace){

			var c = connection.toJSON();
			c.kind = "addConnection";
			c.id = connection.get('_id');
			c.workspace_id = connection.workspace.id;

			this.post(c);

		},

		removeConnection: function(connection){

			if (connection.silentRemove)
				return;
			var c = connection.toJSON();
			c.kind = "removeConnection";
			c.id = connection.get('endNodeId');
			c.portIndex = connection.get('endPortIndex');
			c.startPortIndex = -1;
			c.workspace_id = connection.workspace.id;

			this.post( c );

		},	

		recompile: function(workspace){

			var c = workspace.toJSON();
			c.kind = "recompile";

			this.post( c );

		},

		addDefinition: function(workspace) {

            var c = workspace.toJSON();
            c.kind = "addDefinition";
            c.workspace_id = c._id;

            var that = this;
            workspace.get('nodes').each(function (x) {
                that.watchNodeEvents.call(that, x);
            });

            this.listenTo(workspace.get('connections'), 'add', function (x) {
                this.addConnection(x);
                this.recompile(workspace);
                this.workspace.trigger('requestRun');
            });

            this.listenTo(workspace.get('connections'), 'remove', function (x) {
                this.removeConnection(x);
                this.recompile(workspace);
                this.workspace.trigger('requestRun');
            });

            this.listenTo(workspace.get('nodes'), 'add', function (x) {
                this.addNode(x);
                this.recompile(workspace);
                this.workspace.trigger('requestRun');
            });

            this.listenTo(workspace.get('nodes'), 'remove', function (x) {
                this.removeNode(x);
                this.recompile(workspace);
                this.workspace.trigger('requestRun');
            });

            this.post(c);

        },

		on_recompile: function(data){
			console.log(data);
		},

		reset: function(){

			this.initWorkspace();

		}

		});

});