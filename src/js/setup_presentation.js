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

// setup_presentation
define(['ongoing','event0','camera_driver','jquery', 'tweenjs'], 
    function(task, event0, camera_driver, jquery, tween){
    // Tween is not imported as require.js, but in global space 
    //   under name "createjs"
    var Tween = createjs.Tween;
    var Ease = createjs.Ease;
    
    var slide_messages = {
        "m-1"   :   "1st message",
        "m-2"   :   "2nd message"
    };
    var camera_positions = {
        "c-1-0" :   {

        },
        "c-1-1" :   {

        }
    }; 


    var Presentation = function(app){
        // This Presentation object relies on the app
        console.log("Building presentation");
        var thispresentation = this;
        
        var camera = app.shared.camera;
        var camdriver = new camera_driver.SimpleDriver(camera, app);

        // Generic slide task & action task & pause task
        var slide_task = function(index, html_content){
            // @param:      html_content    html content (slide text)
            // @param:      index           slide's index
            // @returns:    a slide task 
            var slide_instructions = function(input, cwd, cif){
                var thistask = this;
                var thisapp = thistask.thisapp;
    
                $(thisapp.shared.html_slide).find("#slide-content").html(html_content);
                
                // Slide controls
                var option_exit = $(thisapp.shared.html_slide).find("#slide_cancel")[0];
                var option_next = $(thisapp.shared.html_slide).find("#slide_next")[0];
                var option_restart = $(thisapp.shared.html_slide).find("#slide_restart")[0];
                var option_pause = $(thisapp.shared.html_slide).find("#slide_pause")[0];
                var option_paused = $(thisapp.shared.html_slide).find("#slide_paused")[0];
                var handler_exit = function(evt) {
                    evt.preventDefault();
                    thistask.cancel(); 
                    // Reset scene (camera initial setup)
                    thisapp.shared.reset_camera();
                };
                $(option_exit).one("click", handler_exit); 
                var handler_next = function(evt) {
                    evt.preventDefault();
                    cwd("NEXT");
                };
                $(option_next).one("click", handler_next);
                var handler_restart = function(evt) {
                    evt.preventDefault();
                    //thistask.cancel();
                    //Restart presentation
                    thisapp.shared.reset_camera();
                    thispresentation.restart();
                };
                $(option_restart).one("click", handler_restart);
                var handler_pause = function(evt) {
                    evt.preventDefault();
                    window.clearTimeout(timeout);
                    $(option_pause).css("display", "none");
                    $(option_paused).css("visibility", "visible");
                };
                $(option_pause).one("click", handler_pause);
                var handler_paused = function(evt) {
                    evt.preventDefault();
                    cwd("NEXT");
                };
                $(option_paused).one("click", handler_paused);

                thisapp.shared.view_manager.show_slide(); 
    
                // The timeout duration is adjusted to the lenght of the message
                var timeout = window.setTimeout(function(){
                    cwd("TIMEOUT");
                },4000*html_content.length/100+500);
            
                thistask.on("error", function(){
                    //console.log("error handled in slide task (it should be timeout called in calceled state)");
                });
                thistask.on("cleanup", function(){
                    window.clearTimeout(timeout);
                    $(option_pause).css("display", "block");
                    $(option_paused).css("visibility", "hidden");
                    $(option_exit).off("click");
                    $(option_next).off("click");
                    $(option_restart).off("click");
                    $(option_pause).off("click");
                    thisapp.shared.view_manager.hide_slide(); 
                });
            };
            var my_task = task(slide_instructions, null, app).name("Presentation, slide "+index);
            return my_task;
        };
        var action_task = function(index, specs, duration){
            // @param:      specs           camera driver action specs
            // @param:      index           slide's index
            // @returns:    an action task 
            var action_instructions = function(input, cwd, cif){
                var thistask = this;
                var thisapp = thistask.thisapp;
    
                thisapp.shared.dettach_camera_controls();
    
                //TODO: the camdriver does not seem to work OK with origin specs
                camdriver.set(specs);
                camdriver.go(duration);
                camdriver.once("done", function(){
                    cwd("camera in place");
                });
                this.on("cleanup", function(){
                    thisapp.shared.attach_camera_controls();
                });

            };
            var my_task = task(action_instructions, null, app).name("Presentation, action "+index);
            return my_task;
        };
        var pause_task = function(index, duration){
            // @param:      duration        pause duration (seconds)
            // @param:      index           slide's index
            // @returns:    a pause task 
            var pause_instructions = function(input, cwd, cif){
                var thistask = this;
                var thisapp = thistask.thisapp;
    
                var timeout = window.setTimeout(function(){
                    cwd("TIMEOUT");
                },duration*1000);
            
                thistask.on("cleanup", function(){
                    window.clearTimeout(timeout);
                });
            };
            var my_task = task(pause_instructions, null, app).name("Presentation, pause "+index);
            return my_task;
        };
        var move_slider_D_task = function(index, value, duration){
            // @param:      value           slider target value
            // @param:      index           slide's index
            // @returns:    an slider movement task 
            var action_instructions = function(input, cwd, cif){
                var thistask = this;
                var thisapp = thistask.thisapp;
                var slider = thisapp.shared.slider_D;
    
                thisapp.shared.dettach_camera_controls();
    
                // TODO: do it w/o Tween?
                // (1) Get slider current value
                // Tween
                var tweenparam = {};
                tweenparam.value = slider.value; // Initial slider value
                var camtween = Tween.get(tweenparam).to(
                    {"value" : value}, 
                    duration,
                    Ease.quadInOut 
                ).call(function(){
                    // End of the tween! 
                    // Disconnect from tick
                    cwd("slider at final position");
                });
                var render_handler = function(delta){
                    Tween.tick(delta);
                    console.log(tweenparam.value);
                    slider.setValue(tweenparam.value);
                };
                thisapp.insertListener('render', render_handler);
                
                this.on("cleanup", function(){
                    thisapp.removeListener('render', render_handler); 
                    thisapp.shared.attach_camera_controls();
                });
            };
            var my_task = task(action_instructions, null, app).name("Presentation, action "+index);
            return my_task;
        }; 
        var select_scenario_task = function(index, value) {
            // @param:      value           scenario id to be selected
            // @param:      index           task index
            // @returns:    a (synchronows) task for selected scenario
            var action_instructions = function(input, cwd, cif){
                var thistask = this;
                var thisapp = thistask.thisapp;

                thisapp.shared.select_scenario(value);
                cwd("Scenario "+value+ " selected.");
            };
            var my_task = task(action_instructions, null, app).name("Presentation, select scenario "+index);
            return my_task;
        };
        var rotate_task = function(index, value) {
            // @param:      value           true/false  to start/stop rotation
            // @param:      index           task index
            // @returns:    a (synchronows) task for activating/deactivating rotation
            var action_instructions = function(input, cwd, cif){
                var thistask = this;
                var thisapp = thistask.thisapp;

                thisapp.shared.cameraControls.autoRotate = value; 
                cwd("Rotate set to "+value);
            };
            var my_task = task(action_instructions, null, app).name("Presentation, rotation on/off  "+index);
            return my_task;
        };
        var reset_task = function(index) {
            // @param:      index           task index
            // Resets camera to initial position   
            var action_instructions = function(input, cwd, cif){
                var thistask = this;
                var thisapp = thistask.thisapp;

                thisapp.shared.reset_camera();
                cwd("Camera to origin");
            };
            var my_task = task(action_instructions, null, app).name("Presentation, reset camera position and settings "+index);
            return my_task;
        };
        /**
            Arrange task sequence from 
            Presentation.prototype.taskSequence
            which is a list with 2 types of items:
            ["slide",<index>,<html content>]
            ["action",<index>,<duration>,<camera driver specs>] 
            A task is created for each item in the secuence.
            Then the sequence is arranged (next() method in task)
        */
        this.task_list = [];
        this.sequence.forEach( function(item, i){
            // Shouldn't this dispatcher object be outside this function? 
            //  --> (Fast thought, 20140515, while hacking for Spanish language)
            var dispatcher = {
                "slide"     : function(param_list){
                    var idx = param_list[1];                        
                    // Fast hack to include translation to Spanish (20140515)
                    if (app.config.language === "ES") {
                        var html_content = param_list[3];                        
                        // If content is still not translated, use english version
                        if (html_content === undefined) {
                            html_content = param_list[2]; 
                        }
                    } else {
                        var html_content = param_list[2];                        
                    }
                    return slide_task(idx, html_content);
                },
                "action"    : function(param_list){
                    var idx = param_list[1];                        
                    var duration = param_list[2];                        
                    var specs = param_list[3];                        
                    return action_task(idx, specs, duration);
                },
                "move slider D"  : function(param_list){
                    var idx = param_list[1];
                    var duration = param_list[2];
                    var value = param_list[3];
                    return move_slider_D_task(idx, duration, value);
                },
                "pause"     : function(param_list){
                    var idx = param_list[1];
                    var duration = param_list[2];
                    return pause_task(idx, duration);
                },
                "scenario"  : function(param_list){
                    var idx = param_list[1];
                    var value = param_list[2];
                    return select_scenario_task(idx, value);
                },
                "rotate"  : function(param_list){
                    var idx = param_list[1];
                    var value = param_list[2];
                    return rotate_task(idx, value);
                },
                "reset"  : function(param_list){
                    var idx = param_list[1];
                    return reset_task(idx);
                }
            };

            thispresentation.task_list.push(
                dispatcher[item[0]](item)
            );
            if (i>0) {
                thispresentation.task_list[i-1].next(thispresentation.task_list[i]);         
            }
        });

        // Signal end of presentation
        var last_task = this.task_list[this.task_list.length-1];
        last_task.on("done", function() {
            thispresentation.emit("end", "presentation ended");
        });
        last_task.on("fail", function() {
            thispresentation.emit("end", "presentation ended (failed)");
        });
        last_task.on("cancel", function() {
            thispresentation.emit("end", "presentation ended (canceled)");
        });

    };
    Presentation.prototype = Object.create(event0.EventEmitter.prototype);
    // TODO: better than inheriting, we try to compose and offer a (partial) tasks's interface
    Presentation.prototype.go = function(){
        // Signal start of presentation
        this.emit("start", "presentation started...");
        this.task_list[0].go();

    };
    Presentation.prototype.cancel = function(){

    };
    Presentation.prototype.restart = function(){
        this.task_list[0].reset();
        console.log("HERE");
        this.go();
    };
    Presentation.prototype.sequence = [
        ["scenario", "x", 1],
        ["reset", "_"],
        ["slide", "1", "<h5 style=\"font-size: 140%;\">Dolly Zoom</h5>"],
        ["slide", "2", 
            "<p>&quot;The dolly zoom is an unsettling in-camera effect that appears to undermine normal visual perception.&quot; (Wikipedia)</p>",
            "<p>&quot;El <em>dolly zoom</em> es un efecto perturbador realizado con la cámara que parece alterar la percepción visual ordinaria&quot; (Wikipedia en inglés).</p>" 
        ],
        ["slide", "3", 
            "<p>Like this...</p>",
            "<p>Así:</p>"
        ],
        ["pause", "_", 1],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8
        }],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["pause", "_", 1],
        ["slide", "4", 
            "<p>Again.</p>",
            "<p>Otra vez.</p>"
        ],
        ["pause", "_", 1],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8
        }],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["pause", "_", 1],
        ["slide", "5", 
            "<p>You may have seen this effect in films like <em>Vertigo</em>, <em>Jaws</em> and many others... </p>",
            "<p>Puede que hayas visto este efecto en películas como <em>Vértigo</em>, <em>Tiburón</em> y muchas otras... </p>"
        ],
        ["slide", "6", 
            "<p>How is it done?</p>",
            "<p>¿Cómo se consigue?</p>" 
        ],
        ["slide", "7", 
            "<p>First we need to learn the difference between Dolly and Zoom.</p>",
            "<p>Primero necesitamos aprender a diferenciar entre <em>Dolly</em> y <em>Zoom</em>.</p>"
        ],
        ["slide", "8", 
            "<h5>Dolly</h5><p>In order to do the Dolly, we move the camera closer to or farther from the objects in the scene.</p>",
            "<h5>Dolly</h5><p>Para hacer <em>Dolly</em> acercamos o alejamos la cámara en relación a los objetos de la composición.</p>"
        ],
        ["slide", "9", 
            "<h5>Dolly</h5><p>Let's walk away.</p>",
            "<h5>Dolly</h5><p>Vamos a alejarnos.</p>"
        ],
        ["pause", "_", 1],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["pause", "_", 1],
        ["slide", "10", 
            "<h5>Dolly</h5><p>Here we are. Pay attention to the sizes of the chessboard and the mountains in the background.</p>",
            "<h5>Dolly</h5><p>Ahora presta atención a los tamaños del tablero y las montañas del fondo.</p>"
        ],
        ["slide", "11", 
            "<h5>Dolly</h5><p>Now let's get closer using our feet.</p>",
            "<h5>Dolly</h5><p>Acerquémonos <em>con los pies</em>.</p>"
        ],
        ["pause", "_", 1],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["pause", "_", 1],
        ["slide", "12", 
            "<h5>Dolly</h5><p>While the chessboard gets much bigger (8 times), the mountains in the far background hardly change their size.</p>",
            "<h5>Dolly</h5><p>Mientras que el tablero se hace mucho mayor (8 veces), las montañas en la lejanía apenas cambian de tamaño.</p>"
        ],
        ["slide", "13", 
            "<h5>Dolly</h5><p>Let's get away again so that we can use the Zoom instead.</p>",
            "<h5>Dolly</h5><p>Vamos a alejarnos de nuevo para poder usar el zoom esta vez.</p>"
        ],
        ["pause", "_", 1],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["pause", "_", 1],
        ["slide", "14", 
            "<h5>Zoom</h5><p>When we use the zoom we change the focal length of our camera's lense (with our fingers) to make things <em>look</em> bigger and closer.</p>",
            "<h5>Zoom</h5><p>Al usar el zoom cambiamos la longitud focal de la lente de nuestra cámara (con nuestros dedos) para hacer que los objetos <em>parezcan</em> mayores y más cercanos.</p>"
        ],
        ["slide", "15", 
            "<h5>Zoom</h5><p>Our feet stay where they are. It is as if our sight got closer while we stay in place.</p>",
            "<h5>Zoom</h5><p>Nuestros pies permanecen en su sitio. Es como si nuestra mirada se acercara mientras que nosotros no nos movemos.</p>"
        ],
        ["pause", "_", 1],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8
        }],
        ["pause", "_", 1],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["pause", "_", 1],
        ["slide", "16", 
            "<h5>Zoom</h5><p>Let's zoom in again. Pay attention to the sizes of the chessboard and the background mountains.</p>",
            "<h5>Zoom</h5><p>Vamos a usar el zoom de nuevo. Atención a los tamaños del tablero y las montañas del fondo.</p>"
        ],
        ["pause", "_", 1],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8
        }],
        ["pause", "_", 1],
        ["slide", "17", 
            "<h5>Zoom</h5><p>Using the Zoom the mountains in the background get 8 times bigger, the same as for the chessboard in the foreground... and every other object in the scene!</p>",
            "<h5>Zoom</h5><p>Al usar el zoom las montañas en el fondo aumentan su tamaño 8 veces, lo mismo que pasa con el tablero en primer plano... ¡y con todos los demás objetos de la composición!</p>"]
        ,
        ["slide", "18", 
            "<p>Let's get back to the chessboard to go for the Dolly Zoom.</p>",
            "<p>Volvamos cerca del tablero para probar el Dolly Zoom.</p>"
        ],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["slide", "19", 
            "<h5>Dolly Zoom</h5><p>Let's walk a few steps back ...</p>",
            "<h5>Dolly Zoom</h5><p>Caminamos unos cuantos pasos hacia atrás ...</p>"
        ],
        ["pause", "_", 1],
        ["action", "1", 1, {
            destination : new THREE.Vector3(0,0,20), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["pause", "_", 1],
        ["slide", "20", 
            "<h5>Dolly Zoom</h5><p>...and then zoom in to compensate and frame the chessboard again.</p>",
            "<h5>Dolly Zoom</h5><p>...y aumentamos el zoom para compensar y encuadrar el tablero de nuevo.</p>"
],
        ["action", "1", 1, {
            destination : new THREE.Vector3(0,0,20), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 2
        }],
        ["pause", "_", 1],
        ["slide", "21", 
            "<h5>Dolly Zoom</h5><p>A few additional steps back ...</p>",
            "<h5>Dolly Zoom</h5><p>Nos alejamos unos cuantos pasos más ...</p>"
        ],
        ["action", "1", 1, {
            destination : new THREE.Vector3(0,0,40), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 2
        }],
        ["pause", "_", 1],
        ["slide", "22", 
            "<h5>Dolly Zoom</h5><p>...and we zoom in again.</p>",
            "<h5>Dolly Zoom</h5><p>...y aumentamos el zoom de nuevo.</p>"
        ],
        ["action", "1", 1, {
            destination : new THREE.Vector3(0,0,40), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 4
        }],
        ["pause", "_", 1],
        ["slide", "3", 
            "<h5>Dolly Zoom</h5><p>One last time: backwards Dolly first ...</p>",
            "<h5>Dolly Zoom</h5><p>Por última vez: hacemos <em>Dolly</em> alejándonos ...</p>"
        ],
        ["action", "1", 1, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 4
        }],
        ["pause", "_", 1],
        ["slide", "23", 
            "<h5>Dolly Zoom</h5><p>... and we finally compensate with the Zoom.</p>",
            "<h5>Dolly Zoom</h5><p>... y finalmente compensamos con el <em>Zoom</em>.</p>"
        ],
        ["action", "1", 1, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8
        }],
        ["pause", "_", 1],
        ["slide", "24", 
            "<h5>Dolly Zoom</h5><p>Now let's do it again, but this time smoothly. So we achieve the Dolly Zoom effect!</p>",
            "<h5>Dolly Zoom</h5><p>Para concluir vamos a repetir el proceso, pero esta vez de forma continua. ¡Así obtenemos el efecto <em>Dolly Zoom</em>!</p>"
        ],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["pause", "_", 1],
        ["action", "1", 4, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8 
        }],
        ["pause", "_", 1],
        ["slide", "25", 
            "<p>Now you can play with the controls below to reproduce the Dolly, the Zoom and the Dolly Zoom.</p>",
            "<p>Ahora puedes jugar con los controles de más abajo para reproducir el <em>Dolly</em>, el <em>Zoom</em> y el <em>Dolly Zoom</em>.</p>"
        ],
        ["slide", "26", 
            "<p>You can try the Dolly Zoom using different camera locations and angles.</p>",
            "<p>Puedes probar el <em>Dolly Zoom</em> con diferentes posiciones y ángulos de cámara.</p>"
    ],
        ["action", "1", 1, {
            destination : new THREE.Vector3(16,16,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8 
        }],
        ["pause", "_", 1],
        ["action", "1", 2, {
            destination : new THREE.Vector3(2,2,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["action", "1", 2, {
            destination : new THREE.Vector3(16,16,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8 
        }],
        ["pause", "_", 1],
        ["slide", "27", 
            "<p>Experiment with Dolly Zoom while the camera is going around the chessboard. Either far away...</p>",
            "<p>Experimenta con el <em>Dolly Zoom</em> mientras la cámara rodea el tablero. Bien desde lejos ...</p>"
],
        ["reset", "_"],
        ["action", "1", 1, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8 
        }],
        ["rotate","x",true],
        ["pause", "_", 10],
        ["slide", "28", 
            "<p>...or by the chessboard.</p>",
            "<p>...bien cerca del tablero.</p>"
],
        ["reset", "_"],
        ["action", "1", 1, {
            destination : new THREE.Vector3(0,0,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1 
        }],
        ["rotate","x",true],
        ["pause", "_", 10],
        ["slide", "29", 
            "<p>You can even emulate Alfred Hitchcock in the bell tower scene (Vertigo, 1958).</p>",
            "<p>Puedes incluso emular a Alfred Hitchcock en la escena del campanario (Vértigo, 1958).</p>"
        ],
        ["rotate","x",false],
        ["scenario", "1", 2],
        ["reset", "_"],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8
        }],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,0,80), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 8
        }],
        ["action", "2", 2, {
            destination : new THREE.Vector3(0,0,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["pause", "_", 1],
        ["slide", "30", "<p>The End</p>", "<p>Fin</p>"],
        ["slide", "31", "<p>The End</p>", "<p>Fin</p>"],
        ["scenario", "x", 1],
        ["action", "3", 2, {
            destination : new THREE.Vector3(10,0,-10), 
            target_dest : new THREE.Vector3(0,0,-5),
            fovZ_dest   : 1
        }],
        ["action", "1", 6, {
            destination : new THREE.Vector3(0,50,-1000), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }],
        ["action", "1", 2, {
            destination : new THREE.Vector3(0,99,-2000), 
            target_dest : new THREE.Vector3(0,-20,0),
            fovZ_dest   : 1
        }],
        ["action", "1", 1, {
            destination : new THREE.Vector3(0,0,10), 
            target_dest : new THREE.Vector3(0,0,0),
            fovZ_dest   : 1
        }]
    ];


    var setup_presentation = function(thisapp){
        console.log("setup_presentation");

        var presentation = new Presentation(thisapp);

        thisapp.share(presentation, "presentation");
    }; 
    return setup_presentation;
}); 
