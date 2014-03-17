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

// setup_scene3
define(['three','jquery','orbitpan','camera_driver','scenario_1','scenario_2', 'camera_helper'], 
    function(three, jquery, orbitpan, camera_driver,scenario_1, scenario_2, camera_helper){
    //TODO: THREE is in the global scope now, but three is undefined

    // My Camera Helper 
    var FrustumHelper = function(camera){
        var geometry = new THREE.Geometry();
        

        (function buildGeometry(){

            Z = camera.aspect/(2*Math.tan(Math.PI*camera.fov/180)); // Camera zoom (1--> 35mm(eq))
            d = -camera.near;    // Frustum near distance 
            D = -camera.far;     // Frustum far distance
            r = camera.aspect;  // Camrea aspect ratio

            var w = d/Z;
            var h = w/r;
            var W  = D/Z;
            var H  = W/r;

            geometry.dynamic = true;
            geometry.vertices.push( new THREE.Vector3( -w/2, -h/2, d) );
            geometry.vertices.push( new THREE.Vector3(  w/2, -h/2, d ));
            geometry.vertices.push( new THREE.Vector3(  w/2,  h/2, d ));
            geometry.vertices.push( new THREE.Vector3( -w/2,  h/2, d ));
            geometry.vertices.push( new THREE.Vector3( -W/2, -H/2, D ));
            geometry.vertices.push( new THREE.Vector3(  W/2, -H/2, D ));
            geometry.vertices.push( new THREE.Vector3(  W/2,  H/2, D ));
            geometry.vertices.push( new THREE.Vector3( -W/2,  H/2, D ));
        
            geometry.faces.push ( new THREE.Face4( 0, 4, 5, 1 ));   // Bottom plane
            geometry.faces.push ( new THREE.Face4( 2, 6, 7, 3 ));   // Top plane
            geometry.faces.push ( new THREE.Face4( 1, 5, 6, 2 ));   // Right plane
            geometry.faces.push ( new THREE.Face4( 0, 3, 7, 4 ));   // Left plane
        
            geometry.computeFaceNormals();
        })();

        var updateGeometry = function(){

            Z = camera.aspect/(2*Math.tan(Math.PI*camera.fov/180)); // Camera zoom (1--> 35mm(eq))
            d = -camera.near;    // Frustum near distance 
            D = -camera.far;     // Frustum far distance
            r = camera.aspect;  // Camrea aspect ratio

            var w = d/Z;
            var h = w/r;
            var W  = D/Z;
            var H  = W/r;
            geometry.vertices[0].set(-w/2, -h/2, d );
            geometry.vertices[1].set( w/2, -h/2, d );
            geometry.vertices[2].set( w/2,  h/2, d );
            geometry.vertices[3].set(-w/2,  h/2, d );
            geometry.vertices[4].set(-W/2, -H/2, D );
            geometry.vertices[5].set( W/2, -H/2, D );
            geometry.vertices[6].set( W/2,  H/2, D );
            geometry.vertices[7].set(-W/2,  H/2, D );
            geometry.verticesNeedUpdate = true;
        };

        var updatePosRot = function(){
            mesh.position = camera.position; 
            mesh.rotation = camera.rotation; 
        };

        this.update = function(){
            updatePosRot();
            updateGeometry();
        };

        var mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshLambertMaterial({
                color       : 0xff0000,
                wireframe   : false,
                transparent : true, 
                opacity     : 0.2
            })
        );
        this.mesh = mesh;
        this.update();
    };

    var get_camera_3d_icon = function() {
        var icon_wrapper = new THREE.Object3D(); 
        var icon = new THREE.Object3D(); 
        var camera_material = new THREE.MeshPhongMaterial({
                color: 0x101010,
                wireframe: false
        });

        var body = new THREE.Mesh(
            new THREE.CubeGeometry(8,4,3),
            camera_material
        );
        body.position.z = -0.5;
        var lense = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2,1.7,2,16),
            camera_material
        );
        lense.position.z = -3;
        lense.rotation.x = Math.PI/2;
        var hood = new THREE.Mesh(
            new THREE.CylinderGeometry(1.7,2.8,1.4,16),
            camera_material
        );
        hood.position.z = -4.5;
        hood.rotation.x = Math.PI/2;

        icon.add(body);
        icon.add(lense);
        icon.add(hood);
        icon.scale.set(0.5,0.5,0.5);
        icon.position.z = 2; 
        
        icon_wrapper.add(icon); 
        return icon_wrapper;
    };


    // SETUP function to export
    var setup_scene3 = function(thisapp){
        /** 
         *
         */
        console.log("setup_scene3");

        var container = $(thisapp.shared.html_container3d);
        // Renderer
        var renderer = new THREE.WebGLRenderer( {antialias: true} );
        renderer.setSize( container.width(), container.height());
        renderer.gammaOutput = false;
        //renderer.setClearColor(0xa5b7dd,1);
        renderer.setClearColor(0x000000,1);
        renderer.autoClear = false;
        container.append( renderer.domElement );
        // Sizes for renderer and viewports, should match css
        var W = null;
        var H = null;
        var W1 = null; 
        var H1 = null;
        var W2 = null;
        var H2 = null;
        /**
         The following line tries to solve a problem of canvas 3d not filling the whole container
         multiply by the device pixel ratio in order to properly support high DPI displays
         --> http://threejs.org/examples/webgl_multiple_views.html
         --> http://www.quirksmode.org/blog/archives/2010/04/a_pixel_is_not.html
         --> https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag
        */
        var dpr = window.devicePixelRatio || 1; 
        var update_viewport_dims = function(){
            W = container.width()*dpr;
            H = container.height()*dpr;
            W1 = W*3/4;
            H1 = H; 
            W2 = W*1/4;
            H2 = H;
        };
        update_viewport_dims();
        // Shadows
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFShadowMap;    

        // CAMERAS
        // Main Camera
        var camera = new THREE.PerspectiveCamera(
            37.8,
            W1/H1,
            0.01, 4000
        );
        camera.setLens(thisapp.config.unity_focal_length); // Zoom set to 1.0 TODO: does this work?
        camera.updateProjectionMatrix();
        var reset_camera = function(){
            camera.position.set( 0, 0, 10);
        };
        reset_camera(); 
        var cameraControls = new THREE.OrbitAndPanControls(
            camera, renderer.domElement
        );
        cameraControls.autoRotateSpeed = 20.0;
        cameraControls.target.set( 0,0,0 );
        // We add the driver to the camera
        // TODO: var cameraDriver = new MY.CameraDriver(camera);
        var cameraHelper = new camera_helper.CameraHelper( camera );
        var cameraHelper2 = new FrustumHelper( camera );
        // Window resize --> update camera

        // Camera icon (originally was a sprite, hence the name)
        var sprite = get_camera_3d_icon();
        sprite.position = camera.position;
        //sprite.scale.set( 6,4,1);
        var sprite_rotation_matrix = new THREE.Matrix4();
        var sprite_update = function(){
            sprite_rotation_matrix.lookAt(camera.position, cameraControls.target, new THREE.Vector3(0,1,0));
            sprite.rotation.setFromRotationMatrix(sprite_rotation_matrix);
            sprite.position = camera.position;
        };

        // Zenith Camera
        var camera2 = new THREE.PerspectiveCamera(
            37.8,
            W2/H2,
            0.01, 4000
        );
        camera2.setLens(24);
        camera2.rotation.x = -Math.PI/2;
        camera2.position.set(5,100,20);

        // On window resize : update camera and renderer dom element size
        var event_handler_resize = function(evt){
            update_viewport_dims();
            renderer.setSize( W, H);

           //camera.aspect = W1/H1;
           //camera.updateProjectionMatrix();
           //camera2.aspect = W2/H2;
           //camera2.updateProjectionMatrix();
        };
        window.addEventListener('resize', event_handler_resize, false);
        // TODO: orientationchange still does not work! (mobile devices)
        window.addEventListener('orientationchange', event_handler_resize, false);

        // SCENE
        var scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xffffff);
        scene.add(cameraHelper);
        scene.add(sprite);
        var scenario_modules = {
            1   : scenario_1,
            2   : scenario_2
        };
        var scenarios = {
        };
        var scenario = null;
        var select_scenario = function(scenario_idx){
            var old_scenario = scenario;
            // Attach scenario to scene taking care to dettach old scenario if present
            if (old_scenario){
                var o = scene.remove(old_scenario.pos3D);
            }
            // Create scenario dynamycally if not yet
            if (scenarios[scenario_idx]){
                scenario = scenarios[scenario_idx];
                scene.add(scenario.pos3D);
            } else {
                scenario_module = scenario_modules[scenario_idx];
                scenario = new scenario_module.Scenario();
                scenarios[scenario_idx] = scenario;
                scenario.build(scene);
            };
        };
        select_scenario(1);
    
        // RENDER LOOP
        var update_camera = function(delta){
            // Update Camera
            cameraControls.update(delta);
        };
        var render = function(){
            // Render
            cameraHelper.update();
            sprite_update();
            //cameraHelper2.update();

            renderer.setViewport(0,0,W,H); 
            renderer.clear();
            renderer.setViewport( 0,0,W1,H1);
            renderer.render(scene, camera);
            renderer.setViewport( W1,0,W2,H2);
            renderer.render(scene, camera2);

        };

        // PUBLIC methods
        var activate_rendering = function(val){
            if (val) {
                thisapp.on('render', update_camera);
                thisapp.on('render', render);
            } else {
                thisapp.removeListener('render', update_camera);
                thisapp.removeListener('render', render);
            };
        };
        var dettach_camera_controls = function(){ thisapp.removeListener('render', update_camera);
        };
        var attach_camera_controls = function(){
            // We need to remove and add all the listeners
            // So that the rendering can be in the proper order
            // Otherwise, strange artifacts occur
            thisapp.insertListener('render', update_camera);
        };
        var get_camera_distance = function(){
            return camera.position.length();    
        };
        var get_camera_focal_length = function(){
            return 35/(2*this.camera.aspect*Math.tan(camera.fov/2*(Math.PI/180)));
        };
        var reset_camera = function(){
            camera.position.set(0,0,10);
            camera.lookAt(scene);
            camera.setLens(thisapp.config.unity_focal_length); 
            camera.updateProjectionMatrix();
        };

        // SHARE
        thisapp.share(camera, "camera");
        thisapp.share(cameraHelper, "cameraHelper");
        thisapp.share(cameraControls, "cameraControls");
        thisapp.share(renderer, "renderer");
        thisapp.share(scene, "scene");
        thisapp.share(activate_rendering, "activate_3d_rendering");
        thisapp.share(dettach_camera_controls, "dettach_camera_controls");
        thisapp.share(attach_camera_controls, "attach_camera_controls");
        thisapp.share(select_scenario, "select_scenario");
        thisapp.share(get_camera_distance, "get_camera_distance");
        thisapp.share(get_camera_focal_length, "get_camera_focal_length");
        thisapp.share(reset_camera, "reset_camera");

    }; 
    return setup_scene3;
});
