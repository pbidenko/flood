define(['backbone', 'ComputationResponse', 'ContentResponse', 'LibraryItemsListResponse',
        'NodeCreationDataResponse'],
    function (Backbone, ComputationResponse, ContentResponse, LibraryItemsListResponse,
              NodeCreationDataResponse) {
    'use strict';

    //Use web socket as a singleton to avoid several connections
    var socket,
        sendTimer,
        settings = {
            maxMessageStack: 100,
            pingTimeout: 1000,
            url: 'ws://127.0.0.1:2100'
        },
        messageStack = [],
        responseMap = {
            'DynamoWebServer.Responses.ContentResponse, DynamoWebServer': ContentResponse,
            'DynamoWebServer.Responses.ComputationResponse, DynamoWebServer': ComputationResponse,
            'DynamoWebServer.Responses.LibraryItemsListResponse, DynamoWebServer': LibraryItemsListResponse,            
            'DynamoWebServer.Responses.NodeCreationDataResponse, DynamoWebServer' : NodeCreationDataResponse
        },
        responseEventMap = {
            'DynamoWebServer.Responses.ComputationResponse, DynamoWebServer': 'computation-completed:event',
            'DynamoWebServer.Responses.LibraryItemsListResponse, DynamoWebServer': 'libraryItemsList-received:event',
            'DynamoWebServer.Responses.SavedFileResponse, DynamoWebServer': 'saved-file-received:event',
            'DynamoWebServer.Responses.NodeCreationDataResponse, DynamoWebServer' : 'creation-data-received:event'
        },
        app;

    return Backbone.Model.extend({

        initialize: function (atts) {
            app = atts.app;
            if (!socket) {
                socket = new WebSocket(settings.url);

                socket.onopen = function () {
                    console.log('Connection established with ' + settings.url);
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
                    //console.log('Socket success: ' + event.data);
                    var response = JSON.parse(event.data)
                    if (responseMap.hasOwnProperty(response.$type)) {
                        var resp = new responseMap[response.$type](response);

                        if (responseEventMap.hasOwnProperty(response.$type)) {
                            app.trigger(responseEventMap[response.$type], resp);
                        }
                    }
                    else{
                        console.log('Socket received: '+ event.data);
                    }
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
                //Push message to the queue
                this.sendLater(obj);
                console.log('Sending. Socket connection not established yet');
            }
        },

        sendLater: function(msg){
            //If array length exceeds maximum size, remove first element
            if( messageStack.length > settings.maxMessageStack ){
                messageStack.pop();
            }

            messageStack.push(msg);
            //If timer already exists, restart it
            window.clearInterval(sendTimer);
            //Start timer which tries to send data from the messages stack
            sendTimer = window.setInterval(function () {
                if(this.socket.readyState === 1){
                    while( messageStack.length ){
                        this.socket.send(messageStack.shift());
                    }

                    window.clearInterval(sendTimer);
                }
            }.bind(this), settings.pingTimeout);
        }
    });
});