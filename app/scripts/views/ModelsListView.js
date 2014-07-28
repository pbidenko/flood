define(['backbone', 'SearchElement', 'SearchElementView', 'SearchCategoryView'], function (Backbone, SearchElement, SearchElementView, SearchCategoryView) {

    var SearchView = Backbone.View.extend({

        tagName: 'ul',
        className: 'list search-list',

        initialize: function (attrs, options) {
            this.app = options.app;
            this.searchView = options.searchView;            
            this.searchElements = [];
        },        

        template: _.template(''),

        events: {
            'keyup .library-search-input': 'searchKeyup'
        },

        render: function () {          
            var categories = getNamespaces(this.app.SearchElements.models).descendants; 
            for(var prop in categories){
                this.$el.append(new SearchCategoryView({
                    model: categories[prop]
                }, 
                {
                    searchElements: this.searchElements,
                    searchView: this.searchView
                }).render().$el);
            }
            
            return this;     
        },

        findElementsByName: function (name) {
            var result = [],
                i = 0,
                len = this.searchElements.length;

            name = name.toLowerCase();
            for( ; i < len; i++ ) {
                if( this.searchElements[i].model.get('name').toLowerCase().indexOf(name) > -1){
                    result.push(this.searchElements[i]);
                }
            }

            return result;
        },

        findElementByCreatingName: function(name){
            var result = null,
                i = 0,
                len = this.searchElements.length;

            name = name.toLowerCase();
            for( ; i < len; i++ ) {
                if( this.searchElements[i].model.get('creatingName').toLowerCase().indexOf(name) > -1 ){
                    result = this.searchElements[i];
                    break;
                }
            }

            return result;  
        },

        expandElements: function(name){
            var elementsToShow,
                i = 0,
                len = 0;

            this.detach();

            //If name is empty, show all categories collapsed
            if(!name){
                len = this.searchElements.length;
                for( ; i < len; i++ ){
                    this.searchElements[i].showWithAncestors();                    
                    this.searchElements[i].toggle(false);
                }
            }
            else {
                elementsToShow = this.findElementsByName(name),                
                len = elementsToShow.length;
                //First hide all visible elements
                this.hideElements();
                
                for( ; i < len; i++){
                    elementsToShow[i].showWithAncestors();
                }
            }

            this.attach();

            return this;
        },

        hideElements: function() {            
            var i = 0,
                len = this.searchElements.length;
            for( ; i < len; i++){
                this.searchElements[i].hide();
            }
        },

        detach: function() {
            this.parent = this.$el.parent();
            this.$el.detach();
        },

        attach: function() {
            this.parent.append(this.$el);
        }
    }),   

    getNamespaces = function (source) {
        var result = {
                descendants: {},
                elements: []
            },
            len = source.length,
            i = 0,
            parent,
            categories,
            category;
        for (; i < len; i++) {
            categories = source[i].get('category').split('.');
            //If there's no root namespace, create namespaces chain from scratch
            if (!result.descendants.hasOwnProperty(categories[0])) {
                createCategoriesInRoot(categories, result);
            }
                //If namespace already exists, check if all descendant namespaces already in there
            else {
                parent = result.descendants[categories.shift()];
                //Use loop over the recursion to avoid stack issues
                while (categories.length) {
                    category = categories.shift();
                    if (parent.descendants.hasOwnProperty(category)) {
                        parent = parent.descendants[category];
                    } else {
                        parent = parent.descendants[category] = {        
                            name: category,                    
                            descendants: {},
                            elements: []
                        }
                    }
                }
            }

            //Put element in created namespace
            putElementInNamespace(source[i], result);
        }

        return result;
    },

    createCategoriesInRoot = function (categories, destination) {
        var category = categories.shift(),
            parentCategory;

        parentCategory = destination.descendants[category] = {         
            name: category,   
            descendants: {},
            elements: []
        };

        while (categories.length) {
            category = categories.shift();
            parentCategory = parentCategory.descendants[category] = {      
                name: category,             
                descendants: {},
                elements: []
            }
        }
    },

    putElementInNamespace = function(element, namespace) {
        var categories = element.get('category').split('.'),
            category;
        while(categories.length){
            category = categories.shift();
            if(!namespace.descendants[category])
                throw new Error('Category not found');

            namespace = namespace.descendants[category];
        }

        namespace.elements.push(element);
    };

    return SearchView;

});

