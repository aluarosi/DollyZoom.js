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

// setup_control_panel
define(['event0','kinetic','acti0_widgets'], function(event0, kinetic, acti0_widgets){

    var PanelDriver = function(html_container){

        var thispaneldriver = this;
    
        var state = {
            button_dollyzoom : false
        };
        this.state = state;

        var attrs = {
            button_dollyzoom : {
                fill : {
                    true  : 'green',
                    false : 'grey'
                }
            }
        };
        this.attrs = attrs;

        var update = {
            // Here update functions for canvas elements are published
        };
        this.update = update;

        // Here we build the panel scene
        var draw_panel = function(){

            //Measures
            var W = html_container.clientWidth;
            var H = html_container.clientHeight;
            var n = 10;
            var measures = {
                button_dollyzoom : {
                    x : W/n * 2,
                    y : H/2,
                    r : H/4
                }
            };

            //Stage
            var stage = new kinetic.Stage({
                container   : html_container,
                width       : html_container.clientWidth,
                height      : html_container.clientHeight
            });
            var layer = new kinetic.Layer();

            
            //Button dollyzoom
            var button_dollyzoom = new kinetic.Circle({
                x: measures.button_dollyzoom.x,
                y: measures.button_dollyzoom.y,
                radius: measures.button_dollyzoom.r,
                fill: attrs.button_dollyzoom.fill[state.button_dollyzoom],
                stroke: 'white',
                strokeWidth: 4
            });
            thispaneldriver.button_dollyzoom = button_dollyzoom;
            thispaneldriver.update.button_dollyzoom = function(value) {
                button_dollyzoom.attrs.fill = attrs.button_dollyzoom.fill[state.button_dollyzoom];  
                layer.draw();
            };
            
            // Build scene
            layer.add(button_dollyzoom);
            stage.add(layer);
        };
        draw_panel(); 
        window.addEventListener("resize", draw_panel);

        // Here we add event listeners to the panel elements
        var set_panel_listeners = function(){
            thispaneldriver.button_dollyzoom.on(
                'click', 
                function(){
                    thispaneldriver.activate_button_dollyzoom(!state.button_dollyzoom); 
                }
            );
        };
        set_panel_listeners();
        //TODO: This is a "dirty" test, makes listeners grow in memory, although it works!
        // We should clear the listeners and set them again on a window resize event
        window.addEventListener("resize", set_panel_listeners);  

    };
    PanelDriver.prototype = Object.create(event0.EventEmitter.prototype);
    PanelDriver.prototype.activate_button_dollyzoom = function(value){
        // (1) Change state --> (2) Emit event --> (3) Update panel
        this.state.button_dollyzoom = value;
        this.emit("control:button:dollyzoom", value);        
        this.update.button_dollyzoom(value);
    };


    // Function to be exported
    var setup_control_panel = function(thisapp){
        console.log("setup_control_panel");

        /**
        var panel_driver = new PanelDriver(thisapp.shared.html_control_panel);
        thisapp.share(panel_driver, "panel_driver");
        */
    
        var slider_D = new acti0_widgets.Slider(
            thisapp.shared.html_slider_D,
            "Dolly"     
        );
        var slider_F = new acti0_widgets.Slider(
            thisapp.shared.html_slider_F,
            "Zoom"     
        );
        var button_dollyzoom = new acti0_widgets.Button(
            thisapp.shared.html_button_DZ,
            "D-Z"
        );
        button_dollyzoom.setValue(true);
        var button_rotate = new acti0_widgets.Button(
            thisapp.shared.html_button_rotate,
            "Rotate"
        );
        button_rotate.setValue(false);
        var bang_reset = new acti0_widgets.Bang(
            thisapp.shared.html_bang_reset,
            "Reset"
        );
        button_rotate.setValue(false);
        var bang_presentation = new acti0_widgets.Bang(
            thisapp.shared.html_bang_presentation,
            "l>"
        );
        
        thisapp.share(slider_D, "slider_D");
        thisapp.share(slider_F, "slider_F");
        thisapp.share(button_dollyzoom, "button_dollyzoom");
        thisapp.share(button_rotate, "button_rotate");
        thisapp.share(bang_reset, "bang_reset");
        thisapp.share(bang_presentation, "bang_presentation");
    };
    return setup_control_panel;
});
