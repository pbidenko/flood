define(['backbone', 'List', 'SearchElement', 'SearchElementView', 'bootstrap', 'CategorySearchView', 'CategorySearch'],
 function(Backbone, List, SearchElement, SearchElementView, bootstrap, CategorySearchView, CategorySearch) {

  return Backbone.View.extend({

    tagName: 'div',
    className: 'workspace-search',

    initialize: function(atts, arr) {
        this.app = arr.app;
        this.appView = arr.appView;

        this.listenTo(this, 'add-element', this.elementClick);

        //Bind to document's click event for hiding toolbox
        //Unbind first to avoid duplicate bindings
        $(window).off('click.models-view');
        $(window).on('click.models-view', function (e) {
            if (e.target !== this.$input[0])
                this.$list.hide();
        }.bind(this));

        this.listenTo(this.app.SearchElements, 'add remove', this.render);
    },

    template: _.template( $('#workspace-search-template').html() ),

    events: {
      'keyup .library-search-input': 'searchKeyup',
      'focus .library-search-input': 'focus',
      'click #delete-button': 'deleteClick',
      'click #undo-button': 'undoClick',
      'click #redo-button': 'redoClick',
      'click #copy-button': 'copyClick',
      'click #paste-button': 'pasteClick',
      'click #export-button': 'exportClick'
    },

    render: function(arg) {

      this.$el.html( this.template( this.model.toJSON() ) );

      this.$input = this.$('.library-search-input');

      this.categorySearchView = new CategorySearchView({model: new CategorySearch()}, {
                app: this.app,
                searchView: this
      });

      this.$list = this.$('.search-list-container').append(this.categorySearchView.render().$el);

      
      // build button tooltips
      this.$el.find('#undo-button').tooltip({title: "Undo"});
      this.$el.find('#redo-button').tooltip({title: "Redo"});

      this.$el.find('#copy-button').tooltip({title: "Copy"});
      this.$el.find('#paste-button').tooltip({title: "Paste"});

      this.$el.find('#delete-button').tooltip({title: "Delete"});

      $('#zoomin-button').tooltip({title: "Zoom in", placement: "left"});
      $('#zoomout-button').tooltip({title: "Zoom out", placement: "left"});
      $('#zoomreset-button').tooltip({title: "Zoom all", placement: "left"});

      this.$el.find('#export-button').tooltip({title: "Export as STL"});

      $('#workspace_hide').tooltip({title: "Switch between 3D view and nodes"});

      $('#help-button').tooltip({title: "Help", placement: "left"});
      $('#feedback-button').tooltip({title: "Feedback", placement: "left"});
      $('#share-button').tooltip({title: "Share", placement: "left"});

    },

    focus: function(event){
      this.$list.show();
      this.$('.library-search-input').select();
    },

    deleteClick: function(){
      this.app.getCurrentWorkspace().removeSelected();
    },

    copyClick: function(){
      this.app.getCurrentWorkspace().copy();
    },

    pasteClick: function(){
      this.app.getCurrentWorkspace().paste();
    },

    undoClick: function(){
      this.app.getCurrentWorkspace().undo();
    },

    redoClick: function(){
      this.app.getCurrentWorkspace().redo();
    },

    addNode: function(nodeModel){

      this.app.getCurrentWorkspace().addNodeByNameAndPosition(nodeModel.get('creationName'), this.appView.getCurrentWorkspaceCenter());
      this.hideSearch();
    },

    exportClick: function(e){

      this.app.getCurrentWorkspace().exportSTL();

    },

    elementClick: function(model) {
        var currentWS = this.app.getCurrentWorkspace();
        var cName = model.get('creationName');
        // Input and Output nodes can be added only into custom node ws
        if (!currentWS.get('isCustomNode') && (cName === 'Input' || cName === 'Output'))
            return;

        this.addNode(model);
    },
    
    hideSearch: function(){
      this.$list.hide();
    },

    searchKeyup: function (event) {
        var searchText = this.$input.val();
        //If the key is Escape or search text is empty, just quit
        if( event.keyCode === 27 ){
            this.app.trigger('hide-search');
            return;
        }

        if (event.keyCode === 13) { // enter key causes first result to be inserted
            var elementToAdd = this.categorySearchView.topResult;
            elementToAdd && this.elementClick(elementToAdd.model);

        } 
        //Expand categories containing matching elements
        else {
            this.categorySearchView.expandElements(searchText);
        }
    }

  });

});

