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

// setup_view_manager
define(['jquery'], function(jquery){

    var viewport_aspect_ratio = 4/3;

    var setup_view_manager = function(thisapp){
        console.log("setup_view_manager");

        // Get html references 
        var html_wrapper = document.querySelector('#wrapper');
        var html_splash = document.querySelector('#splash');
        var html_container3d = document.querySelector('#container3d');
        var html_control_container = document.querySelector('#control-container');
        var html_control_panel = document.querySelector('#control-panel');
        var html_scenario_selector = document.querySelector('#scenario-selector');
        var html_infoview = document.querySelector('#infoview');
        var html_slider_D = document.querySelector('#slider-D');
        var html_slider_F = document.querySelector('#slider-F');
        var html_button_DZ = document.querySelector('#button-DZ');
        var html_button_rotate = document.querySelector('#button-rotate');
        var html_bang_reset = document.querySelector('#bang-reset');
        var html_bang_about = document.querySelector('#bang-about');
        var html_bang_presentation = document.querySelector('#bang-presentation');
        var html_slide = document.querySelector('#slide');
        // TODO: Temporary - development
        var html_controls = document.querySelector('#controls');
        // Slides & presentation
        var html_menu =  document.querySelector('#menu');
        var html_slide =  document.querySelector('#slide');
        // Help&About
        var html_about_page = document.querySelector('#about-page');
        var html_about_link = document.querySelector('#about-link');


        // Set layout
        var adjust_layout = function(){
            console.log("adjust_layout");


            // Get window width and height
            // --> TODO: see if jquery is better than raw dom
            var window_W = window.innerWidth;
            var window_H = window.innerHeight*0.98;

            // Adjust width and height (wrapper)
            if (window_W/window_H > viewport_aspect_ratio){
                $(html_wrapper).height(window_H);
                $(html_wrapper).width(window_H * viewport_aspect_ratio);
            } else {
                $(html_wrapper).width(window_W);
                $(html_wrapper).height(window_W / viewport_aspect_ratio);
            }

            // What about font-size?
            var slide_W = html_slide.clientWidth;
            $("body").css("font-size", slide_W/60);
    
        };
        adjust_layout();
        // Set layout when the window is resized
        window.addEventListener("resize", adjust_layout);


        // View manager public methods
        var view_manager = {
            get_container3d_width   : function(){
                return $(html_container3d).width();
            },
            get_container3d_height   : function(){
                return $(html_container3d).height();
            },
            hide_splash     : function(){
                $(html_splash).css("visibility","hidden");
                $(html_container3d).css("visibility","visible");
                $(html_control_container).css("visibility","visible");
            },
            show_menu : function(){
                $(html_menu).css("visibility","visible");
            }, 
            hide_menu : function(){
                $(html_menu).css("visibility","hidden");
            },
            show_slide : function(){
                $(html_slide).css("visibility","visible");
            },
            hide_slide : function(){
                $(html_slide).css("visibility","hidden");
            },
            show_about_page : function(){
                $(html_about_page).css("visibility","visible");
                $(html_about_page).css("display","block");
            },
            hide_about_page : function(){
                $(html_about_page).css("visibility","hidden");
                $(html_about_page).css("display","none");
            }
        };
        thisapp.share(view_manager, "view_manager");
        // Shore some element references too
        thisapp.share(html_container3d, "html_container3d");
        thisapp.share(html_control_panel, "html_control_panel");
        thisapp.share(html_scenario_selector, "html_scenario_selector");
        thisapp.share(html_infoview, "html_infoview");
        thisapp.share(html_slider_D, "html_slider_D");
        thisapp.share(html_slider_F, "html_slider_F");
        thisapp.share(html_button_DZ, "html_button_DZ");
        thisapp.share(html_button_rotate, "html_button_rotate");
        thisapp.share(html_bang_reset, "html_bang_reset");
        thisapp.share(html_bang_presentation, "html_bang_presentation");
        thisapp.share(html_menu, "html_menu");
        thisapp.share(html_slide, "html_slide");
        thisapp.share(html_about_link, "html_about_link");
        // TODO: Temporary: development
        thisapp.share(html_controls, "html_controls");


        // Set About page click listeners
        $(html_about_page).find("#closex").on("click", function(evt){
            evt.preventDefault();
            view_manager.hide_about_page();  
        });
        
        
    }; 
    return setup_view_manager;
});
