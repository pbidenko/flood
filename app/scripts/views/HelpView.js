define(['backbone'], function(Backbone) {

  return Backbone.View.extend({

    el: '#help',

    events: { "click .exit-help": 'hide', 
              'click .enter-help-section' : 'clickEnterHelpSection',
              'click .exit-all-help' : 'hide',
              'click .exit-help-section' : 'clickExitHelpSection' 
            },

    initialize: function( args, atts ) {
      this.app = atts.app;
    },

    render: function() {

      var template = _.template( $('#help-section-template').html() );

      this.$el.empty();

      this.model.get('sections').forEach(function(section){

        var el = $('#' + section.targetId );
        
        if (!el.length) 
            return;

        var offset = el.offset();
        var height = el.height();
        var width = el.width();

        if (section.offset[0] < 0) {
          width = -10;
        }

        if (section.offset[1] < 0) {
          height = -10;
          width -= 10;
        }

        section.elementPosition = [ offset.left + width, offset.top + height ];
        this.$el.append(template( section ));

      }.bind(this));

      return this;

    },

    getHelpSection: function(e){

      var ui = $(e.target);
      var attr = ui.attr('data-target-id');

      return this.$el.find(".help-section[data-target-id='" + attr + "']");

    },

    clickEnterHelpSection: function(e){

      var ele = this.getHelpSection(e);
      var ui = $(e.target);

      ele.fadeIn();
      ui.fadeOut();

    },

    clickExitHelpSection: function(e){

      var ele = this.getHelpSection(e);
      ele.fadeOut();

    },

    hide: function() {
      this.app.set('showingHelp', false);
    }

  });
});