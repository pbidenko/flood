define(['backbone'], function (Backbone) {

    var ModelsList = Backbone.Model.extend({

        maxNumberResults: 10,
        minResultsForTolerantSearch: 0,

        fillElementList: function (tagList, list, matchCondition) {
            var weight, i, tag, namesIndexes, index,
                namesList = [],
                len = tagList.length;

            // tagList is ordered by tag length (asc) =>
            // weight will decrease with increasing i.
            // so stop cycle if we have enough results
            for (i = 0; i < len && list.length < this.maxNumberResults; i++) {
                tag = tagList[i].tag;
                if (matchCondition(tag)) {
                    // weight is kinda how much it matches
                    weight = filterString.length / tag.length;
                    namesIndexes = tagList[i].namesIndexes;

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
        },

        getNamespaces: function (source) {
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
                if (!source[i].get('category')) {
                    result.elements.push(source[i]);
                }
                else {
                    categories = source[i].get('category').split('.');
                    //If there's no root namespace, create namespaces chain from scratch
                    if (!result.descendants.hasOwnProperty(categories[0])) {
                        this.createCategoriesInRoot(categories, result);
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
                    this.putElementInNamespace(source[i], result);
                }
            }

            return result;
        },

        createCategoriesInRoot: function (categories, destination) {
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

        putElementInNamespace: function (element, namespace) {
            var categories = element.get('category').split('.'),
                category;
            while (categories.length) {
                category = categories.shift();
                if (!namespace.descendants[category]) {
                    throw new Error('Category not found');
                }

                namespace = namespace.descendants[category];
            }

            namespace.elements.push(element);
        },

        getFilteredSearchElementIndexes: function (tagList, filter) {
            filterString = filter.toLowerCase();
            // array of trio {name, index, weight}
            var weightedElements = [];

            this.fillElementList(tagList, weightedElements, matchSimpleCondition);

            // if we don't have enough results and the filterString
            // contains special characters, do fuzzy search
            if (weightedElements.length <= this.minResultsForTolerantSearch
                && containsSpecialCharacters()) {
                regExp = new RegExp(makePattern());
                this.fillElementList(tagList, weightedElements, matchFuzzyCondition);
            }

            var result = [];
            for (var i = 0; i < weightedElements.length; i++) {
                result.push(weightedElements[i].index);
                if (result.length >= this.maxNumberResults)
                    break;
            }

            return result;
        }

    });

    var regExp, filterString,

    containsSpecialCharacters = function () {
        return filterString.indexOf("*") > -1 ||
            filterString.indexOf(".") > -1 ||
            filterString.indexOf(" ") > -1 ||
            filterString.indexOf("\\") > -1;
    },

    makePattern = function () {
        var separator = "(.*)";
        return separator + filterString.trim()
            .replace(/\\/g, "\\\\")
            .replace(/\./g, '\\.')
            .replace(/\*/g, "\\*")
            .replace(/ /g, separator)
            + separator;
    },

    matchSimpleCondition = function (tag) {
        return tag.indexOf(filterString) > -1;
    },

    matchFuzzyCondition = function (tag) {
        return regExp.test(tag);
    };

    return ModelsList;

});