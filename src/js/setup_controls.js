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

// setup_controls
define(['datgui','jquery','three'], function(datgui,jquery,three){
    /**
        datgui -> not imported the requirejs way
        We get the reference to 'dat' instead.
        (Like for jquery)
     */


    // Controls state object
    // Zoom is 2^zoom
    // Distance is 2^distance * 10
    var controls = {
        zoom        : 0,
        distance    : 0,
        dollyzoom   : true,
        rotation    : function(){
        },
        shadows     : true,
        render3d    : false
    };

    var setup_controls = function(thisapp){
        console.log("setup_controls");

        // GUI controls
        var gui = new dat.GUI({autoPlace: false});
        var controlsContainer = $(thisapp.shared.html_controls);
        controlsContainer.append(gui.domElement); 
        //Folders
        var f_visualizer = gui.addFolder("Visualization");
        f_visualizer.open();
        // Distance 
        var ctrl_distance = f_visualizer.add(
            controls,
            'distance', -1, 3 
        ).name("Distance");
        // Zoom
        var ctrl_zoom = f_visualizer.add(
            controls,
            'zoom', -1, 3
        ).name("Zoom");
        // DollyZoom
        var ctrl_dollyzoom = f_visualizer.add(
            controls,
            'dollyzoom'
        ).name("Dolly Zoom");
        // Camera rotation
        var ctrl_rotation = f_visualizer.add(
            controls,
            'rotation'
        ).name("Rotate");
        // Enable/disable shadows
        var ctrl_shadows = f_visualizer.add(
            controls,
            'shadows'
        ).name("Shadows");
        var ctrl_render3d = f_visualizer.add(
            controls,
            'render3d'
        ).name("Render");


        // CONNECTIONS
        ctrl_distance.onChange(function(val){
            set_distance(val);
            // dolly zoom (hard coded)
            if (controls.dollyzoom){ 
                set_zoom(val);
            }
        }); 
        ctrl_distance.listen();

        ctrl_zoom.onChange(function(val){
            set_zoom(val);
            // dolly zoom (hard coded)
            if (controls.dollyzoom){ 
                set_distance(val);
            }
        });
        ctrl_zoom.listen();
    
        var autorotate_flag = false;
        thisapp.shared.cameraControls.autoRotateSpeed = 20.0;
        ctrl_rotation.onChange(function(val){
            console.log(val);
            autorotate_flag = !autorotate_flag;
            thisapp.shared.cameraControls.autoRotate = autorotate_flag;
        });

        ctrl_shadows.onChange(function(val){
            thisapp.shared.renderer.shadowMapEnabled = val;
            thisapp.shared.renderer.updateShadowMap(thisapp.shared.scene, thisapp.shared.camera);
        });

        ctrl_render3d.onChange(function(val){
            thisapp.shared.activate_3d_rendering(val);
        });

        
        // AUX 
        var set_distance = function(val){
            var cam_pos_old = thisapp.shared.camera.position;
            var cam_pos_new = cam_pos_old.clone()
                .divideScalar(cam_pos_old.length())
                .multiplyScalar( Math.pow(2,val) * 10 );
            thisapp.shared.camera.position = cam_pos_new;
            controls.distance = val;
            // Look at origin
            thisapp.shared.camera.lookAt(0,0,0);
        }; 

        var set_zoom = function(val){
            thisapp.shared.camera.setLens( Math.pow(2,val) * thisapp.config.unity_focal_length );
            thisapp.shared.cameraHelper.update();
            controls.zoom = val;
        };

    };
    return setup_controls;
});
