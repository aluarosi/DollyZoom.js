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

// setup_displayzoom
/**
    KineticJS micro-demo
    Shows zoom diagram with KineticJS on a canvas
 */

define(['kinetic'], function(kinetic){

    var setup_displayzoom = function(thisapp){

        // Test1: draw a circle
        var container = document.querySelector("#div_zoom");

        var stage = new kinetic.Stage({
            container   : "div_zoom",
            width       : container.clientWidth,
            height      : container.clientHeight
        });
        var layer = new kinetic.Layer();
    
        var circle = new kinetic.Circle({
            x: 10,
            y: 20,
            radius: 10,
            fill: 'green',
            stroke: 'white',
            strokeWidth: 4
        });

        var initial_zoom = 1; // TODO Temporary, this should be taken from the camera(driver)
        var fust2d = new kinetic.Polygon({
            points: [   0,0, 
                        stage.attrs.height/(2*initial_zoom), stage.attrs.height,
                        -stage.attrs.height/(2*initial_zoom), stage.attrs.height
            ],
            fill:   'white',
            stroke: 'blue',
            opacity: 0.2,
            strokewith: 1,
            rotation: Math.PI,
            x: stage.attrs.width/2,
            y: stage.attrs.height-30
        });

        // Build
        //layer.add(circle);
        layer.add(fust2d);
        stage.add(layer);

        // Events
        circle.on('mouseover', function(evt){
            this.attrs.radius = this.attrs.radius-1;
            layer.draw();
        });

        // Camera image
        var imageObj = new Image();
        var callback = function(){
            var camera = new kinetic.Image({
                x : stage.attrs.width/2-imageObj.width/8,
                y : stage.attrs.height-imageObj.height/4,
                width : imageObj.width/4,
                height : imageObj.height/4,
                image: imageObj
            });
            layer.add(camera);
            layer.draw();
        };
        imageObj.onload = callback;
        imageObj.src = "img/camera.png";

        // Update canvas whenever there is a change in fov (zoom)
        thisapp.shared.camdriver1.on('update-fov', function(zoom){
            fust2d.setPoints([
                0,0, 
                stage.attrs.height/(2*zoom), stage.attrs.height,
                -stage.attrs.height/(2*zoom), stage.attrs.height
            ]);
            layer.draw();
        });

    };
    return setup_displayzoom;
});
