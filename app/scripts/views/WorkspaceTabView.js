define(['backbone'], function(Backbone) {

  return Backbone.View.extend({

    tagName: 'div',
    className: 'workspace-tab',

    initialize: function(atts) { 

      this.app = this.model.app;
      this.listenTo( this.model, 'change:tabName', this.render);
      this.listenTo( this.model, 'change:current', this.render);

    },

    template: _.template( $('#workspace-tab-template').html() ),

    events: {

      'click': 'click',
      'click .remove-button': 'remove',
      'mouseover': 'showEditButton',
      'mouseout': 'hideEditButton',
      'click .edit-button': 'startEdit',
      'blur .workspace-name': 'endEdit',

      // touch
      'touchstart .edit-button': 'startEdit',
      'touchstart': 'toggleShowingEditButton'

    },

    render: function() {

      this.$el.html( this.template( this.model.toJSON() ) );

      if (this.model.get('current') === true){
        this.$el.addClass('current-workspace')
      } else {
        this.$el.removeClass('current-workspace')
      }

      this.$input = this.$('.workspace-name');

    },

    toggleShowingEditButton: function(){

      if ( this.editButtonShown ){
        this.editButtonShown = false;
        this.hideEditButton();
      } else {
        this.editButtonShown = true;
        this.showEditButton();
      }

    },

    showEditButton: function() {
      this.$('.edit-button').css('visibility', 'visible');
    },

    hideEditButton: function() {
      this.$('.edit-button').css('visibility', 'hidden');
    },

    startEdit: function(e) {
      
      this.$input.prop('disabled', false);
      this.$input.focus().select();
      this.$input.css('pointer-events', 'auto');

      e.stopPropagation();
    },

    endEdit: function() {
        // the edit button is still visible on touch devices
        this.hideEditButton();

        this.$input.prop('disabled', true);
        this.$input.css('pointer-events', 'none');
        var newName = this.$input.val();
        this.model.set('name', newName);
        this.model.set('tabName', newName);
    },

    click: function(e) {
      this.model.trigger('setCurrentWorkspace', this.model.get('_id'));
    },

    remove: function(e) {
        // don't remove Home workspace
        if (this.model.get('isCustomNode')) {

            if (this.model.get('askForUnsavedChanges')) {
                this.model.trigger('closing-request', this.model);
            }
            else {
                this.model.trigger('hide', this.model);
            }
        }
        else {
            // clear Home workspace
            this.model.trigger('workspaceRemove', this.model);
            $('#new-home-workspace').click();
        }

        e.stopPropagation();
    }

  });

});