define(['backbone'], function(Backbone) {

	return Backbone.Model.extend({

	  defaults: {
	  	showing: false,
	  	failure: false,
	  	failureMessage: "Unidentified error"
	  },

	  send: function(data){

	  	if ( !data.subject ){
	  		this.set('failureMessage', 'Please supply a subject for your feedback!');
	  		this.set('failure', true);
	  		return;
	  	}

	  	$.post('/feedback', data, function(e){

	  		if (e.length && e.length > 0 ) {
	  			this.set('failureMessage', e[0].msg);
	  			return this.set('failure', true);
	  		}

	  		this.set('failure', false);
	  		this.trigger('success');
	  	}.bind(this));

	  }

	});

});



