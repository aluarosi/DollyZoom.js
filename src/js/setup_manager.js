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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// setup_manager

define(['ongoing','camera_driver','three','jquery'], function(task,camera_driver,three,jq) {

    var instructions = {
        wait_for_loading    : function(input, cwd, cif){
            // We wait for a while...

            // We get the reference to this app, from the task
            var thisapp = this.thisapp; 
            
            // Locate the camera away from the chessboard 
            thisapp.shared.camera.position.set(-200,0,20);

            window.setTimeout(function(){
                cwd("time to hide the splash screen")
            }, 3000);    
        },
        hide_splash : function(input, cwd, cif){ console.log(input);
            var thisapp = this.thisapp;
            thisapp.shared.view_manager.hide_splash();

            // Start rendering the 3d scene 
            thisapp.shared.activate_3d_rendering(true);

            cwd("splash hidden");
        },
        move_camera_closer : function(input, cwd, cif){
            var thisapp = this.thisapp; 
            var camera = thisapp.shared.camera;  
            var camdriver = new camera_driver.SimpleDriver(camera, thisapp);
            thisapp.shared.camera.position.set(-200,0,20);
            thisapp.shared.camera.lookAt(new THREE.Vector3(-100,0,0));
            thisapp.shared.dettach_camera_controls();
            //TODO: the camdriver does not seem to work OK with origin specs
            camdriver.set({
                destination : new THREE.Vector3(0,0,10), 
                target_dest : new THREE.Vector3(0,0,0) 
            });
            camdriver.go(3);
            camdriver.on("done", function(){
                console.log("camera in place");
                cwd("camera in place");
                thisapp.shared.attach_camera_controls();
            });
            this.on("cleanup", function(){
                thisapp.shared.attach_camera_controls();
            });
        },
        show_initial_menu : function(input, cwd, cif){
            var thisapp = this.thisapp;
            var thistask = this;


            var select_play = $(thisapp.shared.html_menu).find("#select_play");
            var select_tour = $(thisapp.shared.html_menu).find("#select_tour");
        
            window.setTimeout(function(){
                thisapp.shared.view_manager.show_menu();
                $(select_play).one("click", function(evt){
                    evt.preventDefault();
                    console.log(evt);
                    cwd({next:"PLAY"});
                });
                $(select_tour).one("click", function(evt){
                    evt.preventDefault();
                    console.log(evt);
                    cwd({next:"TOUR"});
                });
            
            }, 100);         

            this.on('cleanup', function(){
                // Hide menu on cleanup
                thisapp.shared.view_manager.hide_menu();
            });
        }
    };

    var setup_manager = function(thisapp){
        console.log("setup_manager");

        var t0 = task(instructions.wait_for_loading,null, thisapp).name("Wait for loading"); 
        var t1 = task(instructions.hide_splash, null, thisapp).name("Hide splash");
        var t2 = task(instructions.move_camera_closer, null, thisapp).name("Move camera closer");
        var t3 = task(instructions.show_initial_menu, null, thisapp).name("Show initial menu");
        t0.next(t1).next(t2).next(t3);
        t0.go();
        // Spreader
        t3.on("done", function(result){
            if (result.next === "PLAY"){

            } else if (result.next = "TOUR") {
                thisapp.shared.presentation.go();
            }; 
        });


        // GLUE code, event connectors...
        
        var activate_control_panel = function(){
            // Scenario selector
            thisapp.shared.scenario_selector_driver.on("selected", function(scenario_idx){
                thisapp.shared.select_scenario(scenario_idx);
            });
    
            // F & D sliders
            thisapp.shared.slider_D.on("set", function(val){
                var slider_D_val = thisapp.shared.slider_D.getValue();
                var incr_D = val - thisapp.shared.slider_D.getValue();
                set_distance(val*4-1);
                // dolly zoom (hard coded)
                if (thisapp.shared.button_dollyzoom.value){ 
                    var slider_F_val = thisapp.shared.slider_F.getValue();
                    var val_ = slider_F_val + incr_D;
                    set_zoom(val_*4-1);
                    thisapp.shared.slider_F.setValue(val_,"do not emit");
                }
            });   
            thisapp.shared.slider_F.on("set", function(val){
                var slider_F_val = thisapp.shared.slider_F.getValue();
                var incr_F = val - thisapp.shared.slider_F.getValue();
                set_zoom(val*4-1);
                if (thisapp.shared.button_dollyzoom.value){ 
                    var slider_D_val = thisapp.shared.slider_D.getValue();
                    var val_ = slider_D_val + incr_F;
                    set_distance(val_*4-1);
                    thisapp.shared.slider_D.setValue(val_, "do not emit");
                }
            });   
            // AUX 
            var set_distance = function(val){
                var cam_pos_old = thisapp.shared.camera.position;
                var cam_pos_new = cam_pos_old.clone()
                    .divideScalar(cam_pos_old.length())
                    .multiplyScalar( Math.pow(2,val) * 10 );
                thisapp.shared.camera.position = cam_pos_new;
                // Look at origin
                thisapp.shared.camera.lookAt(0,0,0);
            }; 
            var set_zoom = function(val){
                thisapp.shared.camera.setLens( Math.pow(2,val) * thisapp.config.unity_focal_length );
                thisapp.shared.cameraHelper.update();
            };
            // Set initial slider values
            thisapp.shared.slider_D.setValue(0.25);
            thisapp.shared.slider_F.setValue(0.25);
    
            // ROTATE button
            thisapp.shared.button_rotate.on("set", function(val){
                thisapp.shared.cameraControls.autoRotate = val; 
            });
            // RESET bang
            thisapp.shared.bang_reset.on("bang", function(){
                thisapp.shared.button_rotate.setValue(false);
                thisapp.shared.button_dollyzoom.setValue(false);
                thisapp.shared.slider_D.setValue(0.25);
                thisapp.shared.slider_F.setValue(0.25);
                thisapp.shared.button_dollyzoom.setValue(true);
                thisapp.shared.reset_camera();
            });
            // PRESENTATION bang
            thisapp.shared.bang_presentation.on("bang", function(){
                console.log("bang received");
                thisapp.shared.view_manager.hide_menu(); // Just in case menu is displayed
                thisapp.shared.presentation.restart();
            });
        };
        activate_control_panel();

        var deactivate_control_panel = function(){
            thisapp.shared.scenario_selector_driver.removeListeners("selected");
            thisapp.shared.slider_D.removeListeners("set");
            thisapp.shared.slider_F.removeListeners("set");
            thisapp.shared.button_rotate.removeListeners("set");
            thisapp.shared.bang_reset.removeListeners("bang");
            thisapp.shared.bang_presentation.removeListeners("bang");
        };

        // Deactivate/activate control panel when presentation starts/ends
        thisapp.shared.presentation.on("start", function(evt){
            deactivate_control_panel(); 
        });
        thisapp.shared.presentation.on("end", function(evt){
            activate_control_panel(); 
        });

        // Activate link to About&Help page
        $(thisapp.shared.html_about_link).on("click", function(evt){
            evt.preventDefault();
            thisapp.shared.view_manager.show_about_page(); 
        });
    
    };
    return setup_manager;
});
