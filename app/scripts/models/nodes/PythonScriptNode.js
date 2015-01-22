define(['VariableInputNode', 'FLOOD'], function (VariableInputNode, FLOOD) {

    return VariableInputNode.extend({

        initialize: function (attrs, vals) {

            VariableInputNode.prototype.initialize.call(this, attrs, vals);

            var extraCopy = JSON.parse(JSON.stringify( this.get('extra')));
            if(!extraCopy.script){
                extraCopy.script =  "import clr\nclr.AddReference('ProtoGeometry')\n"
                + "from Autodesk.DesignScript.Geometry import *\n"
                + "#The inputs to this node will be stored as a list in the IN variable.\n"
                + "dataEnteringNode = IN\n\n"
                + "#Assign your output to the OUT variable\n"
                + "OUT = 0";

                this.set('extra', extraCopy);
            }

        },

    	updateData: function (values) {
            var pythonScript = JSON.parse(values.data),
                extraCopy = JSON.parse(JSON.stringify( this.get('extra')));

            values.data = codeBlock.Data;
            VariableInputNode.prototype.updateValue.call(this, values);

            if (pythonScript.Script) {
                extraCopy.script = pythonScript.Script;
	            this.set('extra', extraCopy);
            }
        }
    });

});