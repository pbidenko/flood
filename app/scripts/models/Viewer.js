//It was an entry point for all application drawings, but based on 3d.js,
//now 3d.js(Viewport) doesn't expose drawing methods, should be added methods for drawing like it was in 3d.js
define(['backbone'], function (Backbone) {

    return Backbone.Model.extend({

        initialize: function () {
            //this.threeD = new THREE.ThreeD();
            //this.threeD.init();

            Backbone.on('computation-completed:event', this.redrawGeometry, this);
        },

        redrawGeometry: function (param) {
            //Temporary skip drawing unless we have a drawing engine like it was in 3d.js
            if(!this.threeD)
                return;

            this.threeD.reset();

            for (var i = 0; i < param.result.length; i++) {

                if (param.result[i].isGraphic) {
                    var primitivs = param.result[i].graphicPrimitives;

                    for (var j = 0; j < primitivs.length; j++) {
                        if (primitivs[j].primitiveType === 'Point') {
                            var point = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[1].split(';');
                            this.threeD.addPoint(point);
                        }
                        else if (primitivs[j].primitiveType === 'Line') {
                            var point1 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[1].split(';');
                            var point2 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[3].split(';');
                            this.threeD.addLine(point1, point2);
                        }
                        else if (primitivs[j].primitiveType === 'Triangle') {
                            var point1 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[1].split(';');
                            var point2 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[3].split(';');
                            var point3 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[5].split(';');
                            this.threeD.addTriangle(point1, point2, point3);
                        }
                    }
                }
            }

            this.threeD.render();
        }

    });
});