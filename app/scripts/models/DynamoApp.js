define(['backbone', 'models/App', 'SocketConnection', 'SearchElement', 'SaveUploader', 'Workspace'],
    function (Backbone, App, SocketConnection, SearchElement, SaveUploader, Workspace) {

        return App.extend({

            initialize: function () {
                this.socket = new SocketConnection({ app: this });
                this.listenTo(this, 'libraryItemsList-received:event', this.mapLibraryItems);
                this.saveUploader = new SaveUploader({ app: this });
                this.listenTo(this.saveUploader, 'request-workspace-browser-refresh', this.refreshWorkspaceBrowser);
                this.listenTo(this, 'computation-completed:event', this.updateNodes);
                App.prototype.initialize.call(this);
            },

            updateNodes: function(e){
                this.get('workspaces').forEach(function(ws){
                    ws.updateNodeValues(e);
                });
            },

            fetch: function (options) {
                if( this.login.get('showing') ) {
                    this.fetchCore(options);
                }

                this.fetchOptions = options;
            },

            fetchCore : function fetchCore(options) {
                this.login.fetch();

                this.context.fetchWorkspaces()
                    .done(function (response) {
                        var result = this.parse(response);
                        this.set(result, this.options);
                        if (options.success){
                            options.success(response);
                        }
                    }.bind(this))
                    .fail(function (response) {
                      if (options.error){
                            options.error(response);
                        }
                    });
            },

            refreshWorkspaceBrowser: function() {
                if (this.workspaceBrowser) {
                    this.workspaceBrowser.refresh();
                }
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

                this.fetchCore(this.fetchOptions);
            }

        });
    });
