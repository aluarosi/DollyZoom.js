/**
 * This file is part of DollyZoom.js
 * (A 3D interactive Dolly-Zoom experiment for the web browser)
 * https://github.com/aluarosi/DollyZoom.js
 * 
 * Copyright (C) 2014 Alvaro Santamaria Herrero (aluarosi)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// scenario_1
define(['cosa'], function(cosa){

    var Scenario = function(spec){
        // Validate spec
        var spec = spec !== undefined ? spec : {};

        // Extend Cosa
        cosa.Cosa.call(this, spec);
        
        // Children
        this.children = {
            //cloud   :   new H3VIS.Cloud(this)
        };
    
        //Position children
        //var that = this;
        //this.children.cloud.setPos3D = function(position_3d){
        //};
    };
     
    Scenario.prototype = Object.create( cosa.Cosa.prototype );

    Scenario.prototype.paint = function(object_3d){

        var o = object_3d;

        var light = new THREE.HemisphereLight(0x7777aa,0x222244,0.7);
        var light2 = new THREE.DirectionalLight(0xffffff);
        var light3 = new THREE.DirectionalLight(0xffffff,1.5);
        light2.position.set(-50,50,0);
        light2.castShadow = true;
        light2.shadowCameraVisible = true;
        light2.shadowCameraNear = 1;
        light2.shadowCameraFar = 100;
    
        light3.position.set(-20,20,15);
        light3.castShadow = true;
        light3.shadowCameraNear = 20;
        light3.shadowCameraFar = 600;
        light3.shadowCameraLeft = -100;
        light3.shadowCameraRight = 40;
        light3.shadowCameraTop = 10;
        light3.shadowCameraBottom = -10;
        //light3.shadowCameraVisible = true;
        light3.shadowBias = 0.01;
        light3.shadowDarkness = 0.8;
        light3.shadowMapWidth = 2048*4;
        light3.shadowMapHeight = 1024/2;
        o.add(light);
        //o.add(light2);
        o.add(light3);


        var ground_geometry = new THREE.PlaneGeometry(1000,1000,200,200);
        for (var i = 0;i < ground_geometry.vertices.length; i++){
            var vertex = ground_geometry.vertices[i];
            var x = vertex.x;
            var y = vertex.y; 
            vertex.z +=  THREE.Math.randFloatSpread(10) * Math.min(Math.max(Math.abs(x),Math.abs(y)),100)/400;
            if (x > 8+THREE.Math.randFloat(0,10)*Math.max(x,10)/10 && y<20){
                //vertex.z += THREE.Math.randFloat(2,2)*x/100;
                vertex.z += THREE.Math.randFloat(2,2)+(Math.abs(x-8)*Math.abs(y+20))/10000;
            };
        };
        ground_geometry.dynamic = true;
        ground_geometry.verticesNeedUpdate = true;
        ground_geometry.computeFaceNormals();
        ground_geometry.computeVertexNormals();
        var ground = new THREE.Mesh(
            ground_geometry,
            new THREE.MeshPhongMaterial({
                color   :  "#f1ad58" ,
                wireframe : false
            })
        );
        ground.rotation.x = -Math.PI/2;
        ground.position.y = 0;
        ground.receiveShadow = true;

        var support_geometry = new THREE.CubeGeometry(10,0.5,10,10,1,10);
        var support = new THREE.Mesh(
            support_geometry,
            new THREE.MeshPhongMaterial({
                color   :   new THREE.Color().setRGB(0.5,0.5,0.5),
                wireframe : false
            })
        );
        support.position.set(0,0.25,0);
        support.receiveShadow = true;

        // Checker board
        var cboard = new THREE.Object3D();
        var square_geometry = new THREE.CubeGeometry(1,1,0.1,1,1,1);
        var material_dark = new THREE.MeshPhongMaterial({
            color   :   "#000000"
        });
        var material_light = new THREE.MeshPhongMaterial({
            color   :   "#ffffff"
        });
        for (var i=0; i<8; i++){
            for (var j=0; j<8; j++){
                var material;
                if ( i%2 == 0){
                    material = j%2 == 0 ? material_light : material_dark;
                } else {
                    material = j%2 == 1 ? material_light : material_dark;
                }
                var square = new THREE.Mesh(
                    square_geometry,
                    material 
                ); 
                square.rotation.x = -Math.PI/2;
                square.position.x = 0.5-4 + i*1;
                square.position.z = 0.5-4 + j*1;
                square.position.y = 0.5;
                square.receiveShadow = true;
                cboard.add(square);
            };
        };

        // Figures
        var figures = new THREE.Object3D();
        var cone_geometry = new THREE.CylinderGeometry(0.1,0.5,2,16,16);
        var cone = new THREE.Mesh(
            cone_geometry,
            new THREE.MeshPhongMaterial({
                color   :   "#00aa33"
            })
        );
        cone.position.x = 3.5;
        cone.position.y = 1.5;
        cone.position.z = 2.5;
        cone.castShadow = true;

        var sphere_geometry = new THREE.SphereGeometry(0.5,16,16);
        var sphere = new THREE.Mesh(
            sphere_geometry,
            new THREE.MeshPhongMaterial({
                color   :   "#aa5500"
            })
        );
        sphere.position.x = -1.5;
        sphere.position.y = 1.0;
        sphere.position.z = 3.5;
        sphere.castShadow = true;

        figures.add(cone);
        figures.add(sphere);

        // Poles
        var poles = new THREE.Object3D(); 
        var pole_geometry = new THREE.CylinderGeometry(0.25,0.25,8,16,1);
        var top_geometry = new THREE.CubeGeometry(2,0.1,2.0,1,1,1);
        for (var i=0; i<20; i++){
            var pole = new THREE.Mesh(
                pole_geometry,
                new THREE.MeshPhongMaterial({
                    color   :   "#0033aa"
                })
            );
            var top = new THREE.Mesh(
                top_geometry,
                new THREE.MeshPhongMaterial({
                    color   :   "#0033aa"
                })
            );
            top.position.y = 4;
            top.castShadow = true;
            pole.add(top);
            pole.position.x = -6;
            pole.position.z = 4-i*10; 
            pole.position.y = 4;
            pole.castShadow = true;
            poles.add(pole);
        }

        // Poles foreground
        var poles_foreground = new THREE.Object3D(); 
        for (var i=0; i<2; i++){
            var pole = new THREE.Mesh(
                pole_geometry,
                new THREE.MeshPhongMaterial({
                    color   :   "#0033aa"
                })
            );
            var top = new THREE.Mesh(
                top_geometry,
                new THREE.MeshPhongMaterial({
                    color   :   "#0033aa"
                })
            );
            top.position.y = 4;
            top.castShadow = true;
            pole.add(top);
            pole.position.x = 1;
            pole.position.z = 8+i*10; 
            pole.position.y = 4;
            pole.castShadow = true;
            poles_foreground.add(pole);
        }

        // Fake mountains
        var mountains = new THREE.Object3D();
        var mountain_geometry = new THREE.TetrahedronGeometry( 10, 1 )
        for (var i=0; i<100; i++){
            var mountain = new THREE.Mesh(
                mountain_geometry,
                new THREE.MeshPhongMaterial({
                    color   :   "#771100"
                })
            );
            var rnd_scale = THREE.Math.randFloat(1,10);
            //mountain.scale.set(new THREE.Vector3(rnd_scale,rnd_scale,rnd_scale));
            mountain.scale.x = THREE.Math.randFloat(1,4);
            mountain.scale.y = THREE.Math.randFloat(1,2);
            mountain.scale.z = THREE.Math.randFloat(1,4);
            //mountain.position.x = -240+i*10;
            mountain.position.x = THREE.Math.randFloatSpread(500);
            //mountain.position.z = -490; 
            mountain.position.z = -450 + THREE.Math.randFloatSpread(20); 
            mountain.position.y = 4;
            mountain.rotation.z = Math.PI/8;
            mountain.rotation.y = THREE.Math.randFloatSpread(Math.PI);
            mountains.add(mountain);
        }

        // Near object
        var near_object = new THREE.Mesh(
            pole_geometry,
            new THREE.MeshPhongMaterial({
                color       : "#aaaaaa",
                wireframe   : false
            })
        );
        near_object.position.x = 0.5;
        near_object.position.y = 4.0;
        near_object.position.z = 8.5;

        // Sky box
        var path = "img/sky_cube_test_";
        var format = '.png';
        var urls = [
            path + '1' + format, path + '2' + format,
            path + '3' + format, path + '4' + format,
            path + '5' + format, path + '6' + format
        ];

        var textureCube = THREE.ImageUtils.loadTextureCube( urls );

        var shader = THREE.ShaderLib[ "cube" ];
        shader.uniforms[ "tCube" ].value = textureCube;

        var skycube_material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide,
        });

        var skycube_mesh = new THREE.Mesh( 
            new THREE.CubeGeometry( 1000, 1000, 1000 ), 
            skycube_material
        );

        var sphere_material = new THREE.MeshBasicMaterial({ color: 0xdddddd, envMap: textureCube } );
        var sphere_geom = new THREE.SphereGeometry(0.4, 16, 16);
        var sphere_mesh = new THREE.Mesh(
            sphere_geom,
            sphere_material  
        );
        sphere_mesh.position.z = 5 + 0.4;
        sphere_mesh.position.y = 0.3;


        o.add(support);
        o.add(ground);
        o.add(cboard);
        o.add(figures);
        o.add(poles);
        o.add(poles_foreground);
        o.add(mountains);
        //o.add(near_object);
        o.add(skycube_mesh);
        //o.add(sphere_mesh);
        o.position.set(0,-3,-5);
    };


    return {
        Scenario  :   Scenario
    };
});

