define(['backbone'], function(Backbone) {

  'use strict';

  return Backbone.View.extend({

    el: '#feedback',

    events: { 'click #exit-feedback' : 'clickExit',
              'submit #submit-feedback' : 'clickSend', 
              'click #submit-feedback' : 'clickSend',
              'click' : 'clickExit',
              'click .modal-box': 'stopPropagation' 
            },

    template: _.template( $('#feedback-template').html() ),

    initialize: function( args, atts ) {
        this.app = atts.app;

        this.listenTo(this.model, 'change:failure', this.fail);
        this.listenTo(this.model, 'success', this.success);
    },

    render: function() {

      this.$el.html( this.template( this.model.toJSON() ) );

      this.subject = this.$el.find('#feedback-subject');
      this.message = this.$el.find('#feedback-message');
      this.failureView = this.$el.find('#feedback-failure-message');
      this.successView = this.$el.find('#feedback-success-message');
      this.sendingView = this.$el.find('#feedback-sending-message');

      return this;

    },

    stopPropagation: function(e){
      e.stopPropagation();
    },

    fail: function(){

      this.sendingView.hide();

      if (!this.failureView) return;

      if (!this.model.get('failure')) {
        this.failureView.hide();
        return;
      }

      this.failureView.html( this.model.get('failureMessage') );
      this.failureView.show();

    },

    success: function(){

      this.sendingView.hide();
      this.successView.show();

      setTimeout(function(){
        this.app.set("showingFeedback", false);

        this.subject.val("");
        this.message.val("");

        this.successView.fadeOut();
      }.bind(this), 800);

    },

    clickExit: function(e){
      this.app.set("showingFeedback", false);
    },

    clickSend: function(e) {
      
      e.preventDefault();
      this.sendingView.show();
      this.model.send({ subject: this.subject.val(), message: this.message.val() });

    }

  });
});