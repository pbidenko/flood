define(['backbone', 'SearchElement', 'SearchElementView', 'ModelsListView'], function (Backbone, SearchElement, SearchElementView, ModelsListView) {

    var SearchView = Backbone.View.extend({

        tagName: 'div',
        className: 'search-container row',

        initialize: function (attrs, arr) {
            this.app = arr.app;
            this.appView = arr.appView;
            this.on('add-element', this.elementClick);
        },

        template: _.template($('#search-template').html()),

        events: {
            'keyup .library-search-input': 'searchKeyup'
        },

        render: function () {

            this.$el.html(this.template(this.model.toJSON()));

            this.$input = this.$('.library-search-input');
            this.$list = this.$('.search-list');
            this.$list.empty();

            var that = this;
            var prevCategory = '';
            var prevCategoryElem = that.$list;            

            this.modelsListView = new ModelsListView({}, {
                app: this.app,                
                searchView: this
            });

            this.$el.append(this.modelsListView.render().$el);            
        },

        addNode: function (name) {
            this.app.getCurrentWorkspace().addNodeByNameAndPosition(name, this.app.newNodePosition);
        },

        elementClick: function (model) {
            this.addNode(model.get('name'));
            this.app.set('showingSearch', false);
        },

        searchKeyup: _.debounce(function (event) {            
            var searchText = this.$input.val();
            //If the key is Escape or search text is empty, just quit
            if( event.keyCode === 27 ){
                this.app.set('showingSearch', false);
                return;
            }

            if (event.keyCode === 13) { // enter key causes first result to be inserted
                var elementToAdd = this.modelsListView.findElementByName(searchText);
                elementToAdd && this.elementClick(elementToAdd.model);                

            } 
            //Expand categories containing matching elements
            else {
                this.modelsListView.expandElements(searchText);
            }
        }, 400)
    }),

    //Private methods
    showHideAll = function (ul, isHide) {
        var htmlText = isHide ? '[+]' : '[-]';
        if (isHide) {
            ul.find('li').hide();
        }
        else {
            ul.find('li').show();
        }
        ul.find('span.expcol').html(htmlText);
    };

    return SearchView;

});

