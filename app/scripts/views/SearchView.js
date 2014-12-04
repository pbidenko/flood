define(['backbone', 'SearchElement', 'SearchElementView', 'ModelsListView', 'ModelsList'], function (Backbone, SearchElement, SearchElementView, ModelsListView, ModelsList) {

    return Backbone.View.extend({

        tagName: 'div',
        className: 'search-container row',

        initialize: function (attrs, arr) {
            this.app = arr.app;
            this.appView = arr.appView;
            this.on('add-element', this.elementClick);

            this.app.SearchElements.on('add remove', this.render, this);
        },

        template: _.template($('#search-template').html()),

        events: {
            'keyup .library-search-input': 'searchKeyup'
        },

        render: function () {

            this.$el.html(this.template(this.model.toJSON()));

            this.$input = this.$('.library-search-input');

            this.modelsListView = new ModelsListView({model: new ModelsList()}, {
                app: this.app,
                searchView: this
            });

            this.$el.append(this.modelsListView.render().$el);
        },

        addNode: function (nodeModel) {
            this.app.getCurrentWorkspace().addNodeByNameAndPosition(nodeModel.get('creationName'), this.app.newNodePosition);
        },

        elementClick: function (model) {
            var currentWS = this.app.getCurrentWorkspace();
            var cName = model.get('creationName');
            // Input and Output nodes can be added only into custom node ws
            if (!currentWS.get('isCustomNode') && (cName === 'Input' || cName === 'Output'))
                return;

            this.addNode(model);
            this.app.trigger('hide-search');
        },

        searchKeyup: _.debounce(function (event) {
            var searchText = this.$input.val();
            //If the key is Escape or search text is empty, just quit
            if( event.keyCode === 27 ){
                this.app.trigger('hide-search');
                return;
            }

            if (event.keyCode === 13) { // enter key causes first result to be inserted
                var elementToAdd = this.modelsListView.topResult;
                elementToAdd && this.elementClick(elementToAdd.model);                

            } 
            //Expand categories containing matching elements
            else {
                this.modelsListView.expandElements(searchText);
            }
        }, 400)
    });
});

