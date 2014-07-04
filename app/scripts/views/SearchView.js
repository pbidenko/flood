define(['backbone', 'List', 'SearchElement', 'SearchElementView'], function(Backbone, List, SearchElement, SearchElementView) {

  return Backbone.View.extend({

    tagName: 'div',
    className: 'search-container row',

    initialize: function(atts, arr) {
      this.app = arr.app;
      this.appView = arr.appView;
    },

    template: _.template( $('#search-template').html() ),

    events: {
      'keyup .library-search-input': 'searchKeyup'
    },

    render: function(arg) {

      this.$el.html( this.template( this.model.toJSON() ) );

      this.$input = this.$('.library-search-input');
      this.$list = this.$('.search-list');
      this.$list.empty();

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

        var del = { show: 300 };

        var eleView = new SearchElementView({ model: ele }, { appView: that.appView, app: that.app,
            click: function(e){ that.elementClick.call(that, e); } });

        eleView.render();
        eleView.$el.tooltip({ title: ele.attributes.description, delay: del });
        prevCategoryElem.append( eleView.$el );

      });

      var rootCategories = this.$list.find( '> li.search-element' );
      this._showHideAll(rootCategories, true );
    },

    addNode: function(name){

      console.log(this.app.newNodePosition)

      this.app.getCurrentWorkspace().addNodeByNameAndPosition( name, this.app.newNodePosition );

    },

    elementClick: function(ele){

      this.addNode(ele.model.get('name'));
      this.app.set('showingSearch', false);

    },

    searchKeyup: function(event) {

      if ( event.keyCode === 13) { // enter key causes first result to be inserted
        var nodeName = this.$list.find( '.search-element:not(.notmatch,:has(li.search-element))' ).first()
            .find( '.name:not(.category)' ).first().html();
        if (nodeName === undefined )
          return;

        this.addNode( nodeName );
        this.app.set('showingSearch', false);

      } else if ( event.keyCode === 27) { // esc key exits search
        this.app.set('showingSearch', false);
      } else {
        var val = this.$input.val().toLowerCase();

        var checkForMatch = function( liElement ) {
          var name = liElement.find( '> span.name' )[0].innerHTML;

          if ( name.toLowerCase().indexOf( val ) > -1 ) {
            liElement.removeClass( 'notmatch' );
            liElement.find( 'li.search-element' ).removeClass('notmatch');

            return true;
          } else {
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
    }

  });

});

