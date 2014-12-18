/**
 * Created by Masha on 12/5/2014.
 */
define(['backbone', 'jqueryuidialog'], function(Backbone, jqueryuidialog) {

    var dialogConfig = {
        iconHtml: '<i class="fa fa-times confirm-dialog-icon" style="margin-left:1px;"></i>',
        class: 'confirm-window',
        xButtonClass: '.ui-dialog-titlebar-close',
        width: 330,
        textSelector: '#dialog-confirm-text'
    };

    function setContent (name) {
        var dialogContent = 'You have unsaved changes to ' + name +
            '.<br/><br/> Would you like to save your changes?';
        $(dialogConfig.textSelector).html(dialogContent);
    }

    function getDialog () {
        return $('.' + dialogConfig.class);
    }

    function setPositionAndCloseIcon () {
        $(dialogConfig.xButtonClass).html(dialogConfig.iconHtml);

        var dialog = getDialog();
        // coordinates to put the dialog right into the page center
        var x = ($(window).width() - dialog.width()) / 2,
            y = ($(window).height() - dialog.height()) / 2;

        dialog.css({ top: y, left: x });
    }

    return Backbone.View.extend({

        initialize: function() {
            this.listenTo( this.model.app, 'ws-unsaved-changes-presence-received:event', this.askForSaving );
        },

        askForSaving: function (data) {
            var path, fileName,
                ws, saveUploader,
                model = this.model;
            model.savingData = data;
            if (data.hasUnsavedChanges) {
                saveUploader = model.app.saveUploader;
                ws = saveUploader.getWorkspaceByGuid(data.guid);

                path = saveUploader.getPathByGuid(data.guid);
                fileName = saveUploader.getFilename(path);
                if (!fileName) {
                    fileName = ws.get('name') + ' workspace';
                }

                model.app.set('currentWorkspace', ws.get('_id'));

                var resetAction = true;
                setContent(fileName);
                var dialog = $( '#dialog-confirm' ).dialog({
                    modal: true,
                    width: dialogConfig.width,
                    dialogClass: dialogConfig.class,
                    buttons: {
                        "Yes": function() {
                            resetAction = false;
                            dialog.dialog('close');
                            // action will be continued after saving is done
                            saveUploader.trySaveFile();
                        },
                        "No":  function() {
                            resetAction = false;
                            dialog.dialog('close');
                            model.continueAction();
                        },
                        "Cancel":  function() {
                            dialog.dialog('close');
                        }
                    },
                    close: function() {
                        if (resetAction)
                            model.resetAction();
                    }
                });

                setPositionAndCloseIcon();
            }
            else {
                model.continueAction();
            }
        }
    });
});