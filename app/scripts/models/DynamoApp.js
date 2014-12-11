define(['backbone', 'models/App', 'SocketConnection', 'SearchElement', 'SaveUploader', 'Workspace'],
    function (Backbone, App, SocketConnection, SearchElement, SaveUploader, Workspace) {

        return App.extend({

            initialize: function () {
                this.socket = new SocketConnection({ app: this });
                this.on('libraryItemsList-received:event', this.mapLibraryItems, this);
                this.saveUploader = new SaveUploader({ app: this });
                App.prototype.initialize.call(this);
            },

            fetch: function (options) {

                if(this.login.get('showing')) {
                    this.login.fetch();

                    this.context.fetchWorkspaces()
                    .done(function (response) {
                        var result = this.parse(response);
                        this.set(result, options);
                    }.bind(this))
                    .fail(function (response) {
                        options.error(response);
                    });
                }

                this.options = options;
            },

            mapLibraryItems: function (param) {
                //Add elements to collection not via add method to avoid multiple 'add' events trigger
                this.SearchElements.models = param.libraryItems.map(function (item) {
                    return new SearchElement({
                        name: item.name, creationName: item.creationName,
                        displayName: item.displayName, category: item.category, searchTags: item.keywords,
                        description: item.description, inPort: item.parameters,
                        outPort: item.returnKeys, app: this
                    });
                    //Concatenate with already existing SearchElements
                }).concat(this.SearchElements.models);
                //Trigger 'add' event after all elements are added
                this.SearchElements.trigger('add');

                this.login.fetch();

                this.context.fetchWorkspaces()
                    .done(function (response) {
                        var result = this.parse(response);
                        this.set(result, this.options);
                    }.bind(this))
                    .fail(function (response) {
                        options.error(response);
                    });
            },

            newNodeWorkspace: function( callback, silent, customNodeName ) {
              this.context.createNewNodeWorkspace().done(function(data){

                data.isCustomNode = true;
                data.guid = this.makeId();
                data.name = customNodeName;

                // if we need to not send it to the dynamo
                if (silent) {
                    data.notNotifyServer = true;
                }
                var ws = new Workspace(data, { app: this });

                this.get('workspaces').add( ws );
                this.set('currentWorkspace', ws.get('_id') );
                if (callback) callback( ws );

              }.bind(this)).fail(function(){

                console.error("failed to get new workspace");

              });

            },

            loadWorkspace: function( id, callback, silent, makeCurrent ) {

                this.context.loadWorkspace(id).done(function (data) {

                    var ws = this.get('workspaces').get(id);
                    if (ws) return;

                    // if we need to not send it to the dynamo
                    if (silent) {
                        data.notNotifyServer = true;
                    }
                    ws = new Workspace(data, {app: this});
                    this.get('workspaces').add(ws);

                    if (makeCurrent)
                        this.set('currentWorkspace', ws.get('_id'));

                    if (callback)
                        callback(ws);

                }.bind(this)).fail(function () {

                    console.error("failed to get workspace with id: " + id);
                });
            }

        });
    });
