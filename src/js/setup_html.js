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

// setup_html

define([], function(){
    var setup_html = function(thisapp){

        thisapp.share( document.querySelector('#wrapper'), 'html_wrapper');
        thisapp.share( document.querySelector('#container3d'), 'html_container3d');
        thisapp.share( document.querySelector('#container2d'), 'html_container2d');
        thisapp.share( document.querySelector('#controls'), 'html_controls');
        thisapp.share( document.querySelector('#info'), 'html_info');
        thisapp.share( document.querySelector('#splash'), 'html_splash');
        thisapp.share( document.querySelector('#slide-initial'), 'html_slide_initial');
        thisapp.share( document.querySelector('#slide-text'), 'html_slide_text');
        thisapp.share( document.querySelector('#do-tour'), 'html_do_tour');
        thisapp.share( document.querySelector('#do-play'), 'html_do_play');
        thisapp.share( document.querySelector('#tour-text'), 'html_tour_text');
    }; 
    return setup_html;
});
