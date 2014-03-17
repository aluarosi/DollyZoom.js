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

// setup_infoview

define(['jquery'], function(jquery){
    // d3.js is not imported by require but in the global scope

    var InfoView = function(html_container){

        this.update = function(focal_length, distance){
            $("#D").html(distance.toFixed(1));
            $("#F").html(focal_length.toFixed(1));
        };
    };

    var setup_infoview = function(thisapp){
        console.log("infoview",thisapp); 

        var infoview = new InfoView(thisapp.shared.html_infoview);
        thisapp.share(infoview, "infoview");
    
        //Attach to "render" event
        thisapp.on("render", function(){
            infoview.update(
                thisapp.shared.get_camera_focal_length(),
                thisapp.shared.get_camera_distance()
            ); 
        });
    };

    return setup_infoview;
});
