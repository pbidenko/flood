define(['backbone', 'SearchElement', 'SearchElementView', 'SearchCategoryView'], function (Backbone, SearchElement, SearchElementView, SearchCategoryView) {

    var regExp, filterString;

    function matchSimpleCondition(tag){
        return tag.indexOf(filterString) > -1;
    }

    function matchFuzzyCondition(tag){
        return regExp.test(tag);
    }

    function fillElementList(list, matchCondition) {
        var weight, i, tag, namesIndexes, index,
            namesList = [],
            len = this.tagList.length;

        // tagList is ordered by tag length (asc) =>
        // weight will decrease with increasing i.
        // so stop cycle if we have enough results
        for (i = 0; i < len && list.length < this.maxNumberResults; i++) {
            tag = this.tagList[i].tag;
            if (matchCondition(tag)) {
                // weight is kinda how much it matches
                weight = filterString.length / tag.length;
                namesIndexes = this.tagList[i].namesIndexes;

                for (var j = 0; j < namesIndexes.length; j++) {
                    index = namesList.indexOf(namesIndexes[j].name);

                    if (index == -1) {
                        list.push({
                            name: namesIndexes[j].name,
                            index: namesIndexes[j].index,
                            weight: weight
                        });
                        namesList.push(namesIndexes[j].name);

                        if (list.length >= this.maxNumberResults)
                            break;
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
        rootElements: [],

        maxNumberResults: 10,
        minResultsForTolerantSearch: 0,
        topResult: null,
        topCategory: null,

        initialize: function (attrs, options) {
            this.app = options.app;
            this.searchView = options.searchView;
            this.searchElements = [];
        },

        template: _.template(''),

        render: function () {
            var result = getNamespaces(this.app.SearchElements.models);
            var categories = result.descendants, view;
            this.rootElements = [];
            this.topCategory = new SearchCategoryView({
                    model: {
                        name: 'Top result',
                        descendants: {},
                        elements: []
                    }
                },
                {
                    searchElements: this.searchElements,
                    searchView: this.searchView
                });
            this.$el.append(this.topCategory.render().$el);

            if($.isEmptyObject(categories))
            {
                _.each(result.elements, function (element) {
                    view = new SearchElementView({
                        model: element
                    },
                    {
                        searchElements: this.searchElements,
                        searchView: this.searchView
                    });

                    this.searchElements.push(view);
                    this.rootElements.push(view);

                    this.$el.append(view.render().$el);
                }.bind(this));
            }
            else
            {
                for(var prop in categories){
                    view = new SearchCategoryView({
                            model: categories[prop]
                        },
                        {
                            searchElements: this.searchElements,
                            searchView: this.searchView
                        });

                    this.rootElements.push(view);
                    this.$el.append(view.render().$el);

                }

                _.each(result.elements, function (element) {
                    view = new SearchElementView({
                        model: element
                    },
                    {
                        searchElements: this.searchElements,
                        searchView: this.searchView
                    });

                    this.searchElements.push(view);
                    this.rootElements.push(view);

                    this.$el.append(view.render().$el);
                }.bind(this));
            }

            this.setSearchTags();
            this.renderTopResult();
            return this;
        },

        findElementsBySearchTags: function (name) {
            if (!name)
                return;

            var result = [],
                indexes = this.getFilteredSearchElementIndexes(name),
                len = indexes.length;

            for( var i = 0 ; i < len; i++ ) {
                if (i == 0)
                    this.topResult = this.searchElements[indexes[i]];
                result.push(this.searchElements[indexes[i]]);
            }

            return result;
        },

        expandElements: function(name) {
            var elementsToShow,
                i = 0,
                len;

            this.detach();
            this.topResult = null;

            //If name is empty, show all categories collapsed
            if (!name) {
                this.showAndCollapseElements();
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

            this.renderTopResult();
            this.attach();

            return this;
        },

        renderTopResult: function() {
            if (this.topResult) {
                this.topCategory.$el.show();
                this.topCategory.model.elements = [this.topResult.model];
                this.topCategory.render().toggle(null, true);
            }
            else
                this.topCategory.$el.hide();
        },

        setSearchTags: function() {
            this.tagList = [];
            var i, j, searchElementName, tags, tag, index, pair, model;
            var len = this.searchElements.length;
            // generate tagList as array of {tag, pairs {creationName, index}}
            // index is in tagList to not find search results 
	    // in searchElements list for long time
            for (i = 0; i < len; i++) {
                model = this.searchElements[i].model;
                searchElementName = model.get('creationName');
                if (!searchElementName)
                    searchElementName = model.get('name');

                tags = model.get('searchTags');
                if (!tags || !tags.length)
                    tags = [searchElementName];

                for (j = 0; j < tags.length; j++) {
                    tag = tags[j];

                    index = this.tagList.map(function (e) {
                        return e.tag;
                    }).indexOf(tag);

                    pair = {
                        name: searchElementName,
                        index: i
                    };

                    if (index > -1) {
                        this.tagList[index].namesIndexes.push(pair);
                    }
                    else {
                        this.tagList.push({tag: tag, namesIndexes: [pair]});
                    }
                }
            }

            // sort by tag length asc
            this.tagList.sort(function (a, b) {
                return a.tag.length - b.tag.length;
            });
        },

        getFilteredSearchElementIndexes: function (filter) {
            filterString = filter.toLowerCase();
            // array of trio {name, index, weight}
            var weightedElements = [];

            fillElementList.call(this, weightedElements, matchSimpleCondition);

            // if we don't have enough results and the filterString
            // contains special characters, do fuzzy search
            if (weightedElements.length <= this.minResultsForTolerantSearch
                && containsSpecialCharacters()) {
                regExp = new RegExp(makePattern());
                fillElementList.call(this, weightedElements, matchFuzzyCondition);
            }

            var result = [];
            for (var i = 0; i < weightedElements.length; i++) {
                result.push(weightedElements[i].index);
                if (result.length >= this.maxNumberResults)
                    break;
            }

            return result;
        },

        hideElements: function() {
            var i = 0, len = this.rootElements.length;

            for (; i < len; i++) {
                this.rootElements[i].hide();
            }
        },

        showAndCollapseElements: function() {
            var i = 0,
                len = this.rootElements.length,
                elem;
            for ( ; i < len; i++ ) {
                elem = this.rootElements[i];
                elem.show(true);
                if (elem.children) {
                    elem.toggle(null, false, true);
                }
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

