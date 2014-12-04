define(['backbone', 'SearchElement', 'SearchElementView', 'SearchCategoryView'],

  function (Backbone, SearchElement, SearchElementView, SearchCategoryView) {

      return Backbone.View.extend({

          tagName: 'ul',
          className: 'list search-list',
          template: _.template(''),

          tagList: [],
          rootElements: [],

          topResult: null,
          topCategory: null,

          initialize: function (attrs, options) {
              this.app = options.app;
              this.searchView = options.searchView;
              this.searchElements = [];
          },

          render: function () {
              var result = this.model.getNamespaces(this.app.SearchElements.models);
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

              if ($.isEmptyObject(categories)) {
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
              else {
                  for (var prop in categories) {
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
                  indexes = this.model.getFilteredSearchElementIndexes(this.tagList, name),
                  len = indexes.length;

              for (var i = 0 ; i < len; i++) {
                  if (i === 0) {
                      this.topResult = this.searchElements[indexes[i]];
                  }
                  result.push(this.searchElements[indexes[i]]);
              }

              return result;
          },

          expandElements: function (name) {
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

          renderTopResult: function () {
              if (this.topResult) {
                  this.topCategory.$el.show();
                  this.topCategory.model.elements = [this.topResult.model];
                  this.topCategory.render().toggle(null, true);
              }
              else
                  this.topCategory.$el.hide();
          },

          setSearchTags: function () {
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
                          this.tagList.push({ tag: tag, namesIndexes: [pair] });
                      }
                  }
              }

              // sort by tag length asc
              this.tagList.sort(function (a, b) {
                  return a.tag.length - b.tag.length;
              });
          },

          hideElements: function () {
              var i = 0,
                  len = this.rootElements.length;

              for (; i < len; i++) {
                  this.rootElements[i].hide();
              }
          },

          showAndCollapseElements: function () {
              var i = 0,
                  len = this.rootElements.length,
                  elem;

              for (; i < len; i++) {
                  elem = this.rootElements[i];
                  elem.show(true);
                  if (elem.children) {
                      elem.toggle(null, false, true);
                  }
              }
          },

          detach: function () {
              this.parent = this.$el.parent();
              this.$el.detach();
          },

          attach: function () {
              this.parent.append(this.$el);
          }
      });

  });

