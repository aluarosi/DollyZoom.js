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

// scenario_2
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
        var light3 = new THREE.DirectionalLight(0xffffff,0.5);
        var light4 = new THREE.SpotLight(0xffffff, 1.0);
        var light5 = new THREE.SpotLight(0xffffff, 1.0);
        var light6 = new THREE.SpotLight(0xffffff, 0.7);

        light2.position.set(-50,50,0);
        light2.castShadow = true;
        light2.shadowCameraVisible = true;
        light2.shadowCameraNear = 1;
        light2.shadowCameraFar = 100;
    
        light3.position.set(0,0,-15);
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

        light4.position.set(-2,-2,0);
        light4.target.position.set(0,0,-10);
        light5.position.set(-2,-2,-20);
        light5.target.position.set(10,0,-30);
        light6.position.set(20,20,0);
        light6.target.position.set(0,0,-4);

        o.add(light);
        //o.add(light2);
        //o.add(light3);
        o.add(light4);
        o.add(light5);
        o.add(light6);


        /**
         * PARTS
         */
        // Total
        var total = new THREE.Object3D();

        // Module
        var module = new THREE.Object3D(); 

        // Materials
        var mapHeight = THREE.ImageUtils.loadTexture( "img/texture_wood_BN_400.png" );
        mapHeight.anisotropy = 4;
        mapHeight.repeat.set( 0.998, 0.998 );
        mapHeight.offset.set( 0.001, 0.001 )
        mapHeight.wrapS = THREE.RepeatWrapping;
        mapHeight.wrapT = THREE.RepeatWrapping;
        mapHeight.format = THREE.RGBFormat;

        var wood_material = new THREE.MeshPhongMaterial({
            //color   : 0x777779,
            color   : 0xb8904b,
            wireframe : false,
            bumpMap : mapHeight,
            bumpScale : 0.1,
            metal : false
        });
        // Step
        var step_geometry = new THREE.CubeGeometry(1,3.75,0.1,1,1,1);
        var step = new THREE.Mesh(
            step_geometry,
            wood_material
        ); 
        // Flat
        var flat_geometry = new THREE.CubeGeometry(3,3,0.1,1,1,1);
        var flat = new THREE.Mesh(
            flat_geometry,
            wood_material
        ); 
        // Beam
        var beam_geometry = new THREE.CubeGeometry(13,1,1,1,1,1);
        var beam = new THREE.Mesh(
            beam_geometry,
            wood_material
        ); 
        // Support
        var support_geometry = new THREE.CubeGeometry(12.5*0.7,0.5,0.5);
        var support = new THREE.Mesh(
            support_geometry,
            wood_material
        ); 
        // Banister
        // TODO:
        var banister_geometry = new THREE.CubeGeometry(12*0.7,0.5,0.2);
        var banister = new THREE.Mesh(
            banister_geometry,
            wood_material
        ); 
        // Walls
        /**
        var wall_material = new THREE.MeshPhongMaterial({
            color: 0x443330
        });
        var wall_geometry = new THREE.CubeGeometry(15,1,7*0.7,1,1,1);
        var wall = new THREE.Mesh(
            wall_geometry,
            wall_material
        );
        */

        var make_module = function(){
            var module = new THREE.Object3D();
            // Steps
            for (var i=0; i<7; i++) {
                var s = step.clone();
                s.position.x = -3+i*1;
                s.position.z = 7*0.7 - i*0.7;
                module.add(s);
            };
            // Flat top
            f = flat.clone();
            f.position.x = 5;
            f.position.z = 0;
            module.add(f);
            // Beam
            b = beam.clone(); 
            b.position.z = -0.5;
            b.position.y = -2;
            module.add(b); 
            // Support
            s = support.clone();
            s.position.y = -1.75;
            s.position.z = 2.2;
            s.rotation.y = Math.atan2(0.7,1);
            module.add(s);
            // Banister
            ban = banister.clone();
            ban.position.y = -1.75;
            ban.position.z = 6.2;
            ban.rotation.y = Math.atan2(0.7,1);
            module.add(ban);
            // Walls
            /**
            wall_1 = wall.clone();
            wall_1.position.set(0,2,+3.5*0.7);
            module.add(wall_1);
            */
        
            module.position.y = 5;

            var module_locator = new THREE.Object3D();
            module_locator.add(module);

            return module_locator;
        };

        // Sucesive modules
        for (var i=-8; i<7; i++) {
            var m = make_module();
            m.rotation.z = i * Math.PI/2;
            m.position.z = i * 7 * 0.7;
            total.add(m);
        };

        // 4 Columns
        var column_geometry = new THREE.CubeGeometry(1,1,14*7*0.7,1,1,70*0.7);
        var column_1 = new THREE.Mesh(
            column_geometry,
            wood_material 
        );
        column_1.position.set(3,3,-3*7*0.7);
        total.add(column_1);
        var column_2 = column_1.clone();
        column_2.position.set(3,-3,-3*7*0.7);
        total.add(column_2);
        var column_3 = column_1.clone();
        column_3.position.set(-3,3,-3*7*0.7);
        total.add(column_3);
        var column_4 = column_1.clone();
        column_4.position.set(-3,-3,-3*7*0.7);
        total.add(column_4);

        // 4 Outer Columns
        column_5 = column_1.clone();
        column_5.position.set(6,6,-3*7*0.7);
        total.add(column_5);
        var column_6 = column_1.clone();
        column_6.position.set(6,-6,-3*7*0.7);
        total.add(column_6);
        var column_7 = column_1.clone();
        column_7.position.set(-6,6,-3*7*0.7);
        total.add(column_7);
        var column_8 = column_1.clone();
        column_8.position.set(-6,-6,-3*7*0.7);
        total.add(column_8);

        // Floor
        var floor_geometry = new THREE.PlaneGeometry(13,13,1,1);
        var floor_material = new THREE.MeshPhongMaterial({
            color   : 0x444433,
        });
        var floor = new THREE.Mesh(
            floor_geometry,
            floor_material
        );
        floor.position.set(0,0,-8*7*0.7+0.1);
        total.add(floor);

        
        total.scale.set(1,1,1);
        total.position.set(0,0,0);

        // Helper at z=0
        var helper_geometry = new THREE.PlaneGeometry(1,1,1,1);
        var helper = new THREE.Mesh(
            helper_geometry,
            new THREE.MeshLambertMaterial({
                color: 0xff0000,
                transparent: true,  
                opacity: 0.3
            })
        );
        helper.position.set(0,0,0);
        //total.add(helper);
        

        o.add(total);

        
    };


    return {
        Scenario  :   Scenario
    };
});

