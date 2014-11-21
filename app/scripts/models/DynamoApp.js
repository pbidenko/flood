define(['backbone', 'models/App', 'SocketConnection', 'SearchElement'],
    function (Backbone, App, SocketConnection, SearchElement) {

        return App.extend({

            initialize: function () {
                this.socket = new SocketConnection({ app: this });
                this.on('libraryItemsList-received:event', this.mapLibraryItems, this);
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
                    var parameters = [], 
                        returnKeys = [],
                        i = 0,
                        length = item.parameters.length;

                    for(; i < length; i++)
                    {
                        parameters.push({
                            name: item.parameters[i].name,
                            type: item.parameters[i].type,
                            defaultValue: item.parameters[i].defaultValue
                        });
                    }

                    length = item.returnKeys.length;
                    for(i = 0; i < length; i++)
                    {
                        returnKeys.push({
                            name: item.returnKeys[i].name,
                            type: item.returnKeys[i].type,
                            defaultValue: item.returnKeys[i].defaultValue
                        });
                    }

                    return new SearchElement({
                        name: item.name, creationName: item.creationName,
                        displayName: item.displayName, category: item.category,
                        searchTags: item.keywords, description: item.description, 
                        inPort: parameters, outPort: returnKeys,
                        app: this
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
            }

        });
    });
