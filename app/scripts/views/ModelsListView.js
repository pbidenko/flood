define(['backbone', 'SearchElement', 'SearchElementView', 'SearchCategoryView'], function (Backbone, SearchElement, SearchElementView, SearchCategoryView) {

    var regExp, filterString;

    function matchSimpleCondition(tag){
        return tag.indexOf(filterString) > -1;
    }

    function matchFuzzyCondition(tag){
        return regExp.test(tag);
    }

    function fillElementList(list, matchCondition){
        var weight, searchElementName, i, tag, names, index;
        for (i = 0; i < this.tagList.length; i++) {
            tag = this.tagList[i].tag;
            if (matchCondition(tag)) {
                // weight is kinda how much it matches
                weight = filterString.length / tag.length;
                names = this.tagList[i].names;
                for (var j = 0; j < names.length; j++) {
                    index = list.map(function (e) {
                        return e.name;
                    }).indexOf(names[j]);

                    if (index == -1) {
                        list.push({name: names[j], weight: weight});
                    }
                    else if (list[index].weight < weight) {
                        list[index].weight = weight;
                    }
                }
            }
        }
    }

    function containsSpecialCharacters() {
        return filterString.indexOf("*") > -1 ||
            filterString.indexOf(".") > -1 ||
            filterString.indexOf(" ") > -1 ||
            filterString.indexOf("\\") > -1;
    }

    function makePattern() {
        var separator = "(.*)";
        return separator + filterString.trim()
            .replace(/\\/g, "\\\\")
            .replace(/\./g, '\\.')
            .replace(/\*/g, "\\*")
            .replace(/ /g, separator)
            + separator;
    }

    var SearchView = Backbone.View.extend({

        tagName: 'ul',
        className: 'list search-list',

        tagList: [],

        maxNumberResults: 10,
        minResultsForTolerantSearch: 0,
        topResult: null,

        initialize: function (attrs, options) {
            this.app = options.app;
            this.searchView = options.searchView;
            this.searchElements = [];
        },

        template: _.template(''),

        render: function () {
            this.setSearchTags();
            var result = getNamespaces(this.app.SearchElements.models);
            var categories = result.descendants;
            if($.isEmptyObject(categories))
            {
                _.each(result.elements, function (element) {
                    var view = new SearchElementView({
                        model: element
                    },
                    {
                        searchElements: this.searchElements,
                        searchView: this.searchView
                    });

                    this.searchElements.push(view);

                    this.$el.append(view.render().$el);
                }.bind(this));
            }
            else
            {
                for(var prop in categories){
                    this.$el.append(new SearchCategoryView({
                        model: categories[prop]
                    }, 
                    {
                        searchElements: this.searchElements,
                        searchView: this.searchView
                    }).render().$el);
                }

                _.each(result.elements, function (element) {
                    var view = new SearchElementView({
                        model: element
                    },
                    {
                        searchElements: this.searchElements,
                        searchView: this.searchView
                    });

                    this.searchElements.push(view);

                    this.$el.append(view.render().$el);
                }.bind(this));
            }
            
            return this;     
        },

        findElementsBySearchTags: function (name) {
            if (!name)
                return;

            var result = [],
                i = 0,
                creationName,
                index,
                len = this.searchElements.length;

            var names = this.getFilteredSearchElementNames(name);
            for( ; i < len; i++ ) {
                creationName = this.searchElements[i].model.get('creationName');
                index = names.indexOf(creationName);
                if (index > -1) {
                    // if it's the first result make it top one
                    if (index == 0)
                        this.topResult = this.searchElements[i];
                    result.push(this.searchElements[i]);
                }

                // if we've found all results
                if (result.length == names.length)
                    break;
            }

            return result;
        },

        expandElements: function(name) {
            var elementsToShow,
                i = 0,
                len = 0;

            this.detach();
            this.topResult = null;

            //If name is empty, show all categories collapsed
            if (!name) {
                len = this.searchElements.length;
                for (; i < len; i++) {
                    this.searchElements[i].showWithAncestors();
                    this.searchElements[i].toggle(false);
                }
            }
            else {
                elementsToShow = this.findElementsBySearchTags(name);
                len = elementsToShow.length;
                //First hide all visible elements
                this.hideElements();

                for (; i < len; i++) {
                    elementsToShow[i].showWithAncestors();
                }
            }

            this.attach();

            return this;
        },

        setSearchTags: function() {
            this.tagList = [];
            var i, j, searchElementName, tags, tag, index;
            var models = this.app.SearchElements.models;
            // generate tagList as array of {tag, creationNames}
            for (i = 0; i < models.length; i++) {
                searchElementName = models[i].get('creationName');
                if (!searchElementName)
                    searchElementName = models[i].get('name');

                tags = models[i].get('searchTags');
                if (!tags || !tags.length)
                    tags = [searchElementName];

                for (j = 0; j < tags.length; j++) {
                    tag = tags[j];

                    index = this.tagList.map(function (e) {
                        return e.tag;
                    }).indexOf(tag);

                    if (index > -1) {
                        this.tagList[index].names.push(searchElementName);
                    }
                    else {
                        this.tagList.push({tag: tag, names: [searchElementName]});
                    }
                }
            }
        },

        getFilteredSearchElementNames: function (filter) {
            filterString = filter.toLowerCase();
            // array of pair {name, weight}
            var weightedElements = [];

            fillElementList.call(this, weightedElements, matchSimpleCondition);

            // if we don't have enough results and the filterString
            // contains special characters, do fuzzy search
            if (weightedElements.length <= this.minResultsForTolerantSearch
                && containsSpecialCharacters()) {
                regExp = new RegExp(makePattern());
                fillElementList.call(this, weightedElements, matchFuzzyCondition);
            }

            // sort by weight desc
            weightedElements.sort(function (a, b) {
                return b.weight - a.weight;
            });

            var result = [];
            for (var i = 0; i < weightedElements.length; i++) {
                result.push(weightedElements[i].name);
                if (result.length >= this.maxNumberResults)
                    break;
            }

            return result;
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
            //If there's no category, create elements in root
            if(!source[i].get('category'))
            {
                result.elements.push(source[i]);
            }
            else
            {
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

