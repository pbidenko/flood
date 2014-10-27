define(['backbone'], function(Backbone) {

	return Backbone.Model.extend({

	  defaults: {
	  	isLoggedIn : false,
	  	failed : false,
	  	failureMessage : "",
	  	showing: false,
	  	email : ""
	  },

	  initialize: function(atts, vals) {
	  	this.app = vals.app;
	  },

	  fetch : function(){

	  	this.app.context.fetchLogin().done(function(e){
	  		if (e.email) {
	  			this.set('email', e.email);
	  			this.set('isLoggedIn', true);
	  		}
	  		else {
	  			this.set('isLoggedIn', false);
	  		}
	  	}.bind(this));

	  },

		toggle: function(){
		  return this.get('showing') ? this.hide() : this.show();
		},

		show: function() {
		  this.set('showing', true);
		},

		hide: function() {
		  this.set('showing', false);
		},

	  signup: function(data){

	  	var that = this;
	  	$.post('/signup', data, function(e){

	  		if (e.length && e.length > 0 ) {
	  			that.set('failureMessage', e[0].msg);
	  			return that.set('failed', true);
	  		}

	  		that.set('failed', false);
	  		that.app.fetch();
	  	});

	  },

	  login: function(data){

	  	var that = this;
	  	$.post('/login', data, function(e){

	  		if (e.length && e.length > 0 ) {
	  			that.set('failureMessage', e[0].msg);
	  			return that.set('failed', true);
	  		}

	  		that.set('failed', false);
	  		that.app.fetch();
	  	});

	  },

	  logout: function(){

	  	var that = this;
	  	this.app.context.logout().done(function(e){
	  		that.app.fetch();
	  	});

	  }

	});
});
