define(['backbone', 'List', 'SearchElement', 'SearchElementView', 'bootstrap'], function(Backbone, List, SearchElement, SearchElementView, bootstrap) {

  return Backbone.View.extend({

    tagName: 'div',
    className: 'workspace-search',

    initialize: function(atts, arr) {
      this.app = arr.app;
      this.appView = arr.appView;

      //Bind to document's click event for hiding toolbox
      //Unbind first to avoid duplicate bindings
      $(window).off('click.models-view');
      $(window).on('click.models-view', function(e){

        if( e.target !== this.$input[0] &&
            !$(e.target).hasClass( 'expcol' ) &&
            !$(e.target).hasClass( 'category' ) &&
            e.target.localName !== 'li' ) {
            this.$list.hide();
        }
      }.bind(this));
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
      'click #zoomin-button': 'zoominClick',
      'click #zoomout-button': 'zoomoutClick',
      'click #zoomreset-button': 'zoomresetClick'
    },

    render: function(arg) {

      this.$el.html( this.template( this.model.toJSON() ) );

      this.$input = this.$('.library-search-input');
      this.$list = this.$('.search-list');

      this.$list.empty();

      var del = { show: 300 };

      var that = this;
      var prevCategory = '';
      var prevCategoryElem = that.$list;

      this.app.SearchElements.forEach( function(ele) {

        if ( ele.attributes.category !== null ) {
          var categories = ele.attributes.category.split( '.' );
          if ( ele.attributes.category !== prevCategory ) {
            prevCategory = ele.attributes.category;
              prevCategoryElem = that.$list;
              for ( var i = 0; i < categories.length; i++ ) {
                  if ( prevCategoryElem.find( 'li.' + categories[i] ).length == 0 ) {
                      var name = categories[i];
                      var category = ele.attributes.category.replace(' ', '_');
                      categories[i] = categories[i].replace(' ', '_');

                      var elem = new SearchElement({ name: name, category: category, app: that.app });

                      var eleView = new SearchElementView({ model: elem }, { appView: that.appView, app: that.app });

                      eleView.render();
                      eleView.$el.find( 'span' ).addClass( 'category' );
                      eleView.$el.addClass( categories[i] );
                      eleView.$el.prepend( '<span class="expcol">[-]</span>' );
                      var expandCollapse = function(e) {

                          var expColSpan = $(this).hasClass('expcol') ? this :
                              $(this).closest('li').find('> span.expcol')[0];

                          var currentLi = $( expColSpan ).closest( 'li' );

                          if ( expColSpan.innerHTML == '[-]' ) {
                              currentLi.find( 'li' ).hide();
                              currentLi.find( 'span.expcol' ).html( '[+]' );
                          }
                          else {
                              currentLi.find( '> li' ).show();
                              expColSpan.innerHTML = '[-]';
                          }
                      };

                      eleView.$el.find('> span.expcol').click( expandCollapse );
                      eleView.$el.find('> span.category').click( expandCollapse );

                      prevCategoryElem.append(eleView.$el);
                  }

                  prevCategoryElem = prevCategoryElem.find('li.'+categories[i]).first();
              }
          }
        }

        var eleView = new SearchElementView({ model: ele }, { appView: that.appView, app: that.app, 
          click: function(e){ that.elementClick.call(that, e); } });

        eleView.render();
        eleView.$el.tooltip({ title: ele.attributes.description, delay: del });
        prevCategoryElem.append( eleView.$el );

      });

      this.$list.find('> li > span.expcol').click();

      // build button tooltips
      this.$el.find('#undo-button').tooltip({title: "Ctrl/Cmd Z", delay: del});
      this.$el.find('#redo-button').tooltip({title: "Ctrl/Cmd Y", delay: del});

      this.$el.find('#copy-button').tooltip({title: "Ctrl/Cmd C", delay: del});
      this.$el.find('#paste-button').tooltip({title: "Ctrl/Cmd V", delay: del});

      this.$el.find('#delete-button').tooltip({title: "Backspace/Delete", delay: del});

      this.$el.find('#zoomin-button').tooltip({title: "Ctrl/Cmd +", delay: del});
      this.$el.find('#zoomout-button').tooltip({title: "Ctrl/Cmd -", delay: del});
      this.$el.find('#zoomreset-button').tooltip({title: "Ctrl/Cmd 0", delay: del});

    },

    _showHideAll:  function(ul, isHide) {
        var htmlText = isHide ? '[+]' : '[-]';
        if ( isHide ) {
              ul.find( 'li' ).hide();
          }
        else {
              ul.find('li').show();
        }
        ul.find( 'span.expcol' ).html( htmlText );
    },

    focus: function(event){
      this.$('.search-list').show();
      this.$('.library-search-input').select();
    },

    currentWorkspace: function(){
      return this.app.get('workspaces').get( this.app.get('currentWorkspace') );
    },

    deleteClick: function(){
      this.currentWorkspace().removeSelected();
    },

    copyClick: function(){
      this.currentWorkspace().copy();
    },

    pasteClick: function(){
      this.currentWorkspace().paste();
    },

    undoClick: function(){
      this.currentWorkspace().undo();
    },

    redoClick: function(){
      this.currentWorkspace().redo();
    },

    zoomresetClick: function(){
      this.currentWorkspace().set('zoom', 1.0);
    },

    zoominClick: function(){
      this.currentWorkspace().zoomIn();
    },

    zoomoutClick: function(){
      this.currentWorkspace().zoomOut();
    },

    getWorkspaceCenter: function(){
      var w = this.appView.currentWorkspaceView.$el.width()
        , h = this.appView.currentWorkspaceView.$el.height()
        , ho = this.appView.currentWorkspaceView.$el.scrollTop()
        , wo = this.appView.currentWorkspaceView.$el.scrollLeft()
        , zoom = 1 / this.currentWorkspace().get('zoom');

      return [zoom * (wo + w / 2), zoom * (ho + h / 2)];
    },

    addNode: function(name){

      if (name === undefined ) return;
      this.currentWorkspace().addNodeByNameAndPosition( name, this.getWorkspaceCenter() );

    },

    elementClick: function(ele){

      this.addNode( ele.model.get('name') );

    },

    searchKeyup: function(event) {

      // enter key causes first result to be inserted
      if ( event.keyCode === 13) {

        var nodeName = this.$list.find( '.search-element:not(.notmatch,:has(li.search-element))' ).first()
            .find( '.name:not(.category)' ).first().html();
        if (nodeName === undefined )
            return;

        this.addNode( nodeName );

      }
      else {
          var val = this.$input.val().toLowerCase();

          var checkForMatch = function( liElement ) {
              var name = liElement.find( '> span.name' )[0].innerHTML;

              if ( name.toLowerCase().indexOf( val ) > -1 ) {
                  liElement.removeClass( 'notmatch' );
                  liElement.find( 'li.search-element' ).removeClass('notmatch');

                  return true;
              }
              else {
                  var subCategories = liElement.find( '> li.search-element' );
                  var hasMatched = false;

                  for ( var i = 0; i < subCategories.length; i++) {
                      if ( checkForMatch( $( subCategories[i] ) ) ) {
                          hasMatched = true;
                      }
                  }

                  if (hasMatched)
                      liElement.removeClass( 'notmatch' );
                  else
                      liElement.addClass( 'notmatch' );

                  return hasMatched;
                  }
          }

          var rootCategories = this.$list.find( '> li.search-element' );
          for(var i = 0; i < rootCategories.length; i++) {
              checkForMatch( $( rootCategories[i] ) );
          }

          this._showHideAll(rootCategories, val.length == 0 );
      }
    }

  });

});

