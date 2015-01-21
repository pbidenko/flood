define(['Three'], function(THREE) {
    return {

        createFace: function(data){
            return new THREE.Face3( data[0], data[1], data[2],
                [ new THREE.Vector3( data[3][0], data[3][1], data[3][2] ),
                  new THREE.Vector3( data[3][3], data[3][4], data[3][5] ),
                  new THREE.Vector3( data[3][6], data[3][7], data[3][8] )
                ]);
        }

    };
});