define(['backbone'], function (Backbone) {
    'use strict';

    //Use web socket as a sinletone to avoid several connections
    var socket;

    return Backbone.Model.extend({
        defaults: {
            url: 'ws://127.0.0.1:2100'
        },

        initialize: function () {
            if (!socket) {
                socket = new WebSocket(this.get('url'));

                socket.onopen = function () {
                    console.log('Connection established with ' + this.get('url'));
                }.bind(this);

                socket.onclose = function (event) {
                    if (event.wasClean) {
                        console.log('Connection closed');
                    }
                    else {
                        console.log('Connection failure');
                    }

                    console.log('Code: ' + event.code + ' Reason: ' + event.reason);
                };

                socket.onmessage = function (event) {
                    console.log('Socket success: ' + event.data);
                };

                socket.onerror = function (event) {
                    console.log('Socket error: ' + event.message);
                };
            }

            this.socket = socket;
        },

        send: function (obj) {
            if (this.socket.readyState === 1) {
                console.log('Sending: ' + obj);
                this.socket.send(obj);
            } else {
                console.log('Sending. Socket connection not established yet');
            }
        }
    });
});