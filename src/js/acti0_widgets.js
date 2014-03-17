/**
 * This file is part of acti0.js
 * (JavaScript framework for building interactive visualizations in the web browser)
 * https://github.com/aluarosi/acti0.js
 * 
 * Copyright (C) 2013,2014 Alvaro Santamaria Herrero (aluarosi)
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

// widgets

define(['event0','jquery'], function(event0, jquery){

    /**
     * SLIDER
     */
    var Slider = function(html_element, label){
        var thiswidget = this;

        // State
        this.value = 0.9;

        // Build html
        $(html_element).append('<div class="slider-wrapper"><div class="slider-label"></div><div class="slider-bg"><div class="slider-fg"></div></div><div class="slider-value"><input type="text"></div></div>'); 
        $(html_element).css({
            color       : "white",
        });
        $(html_element).find("div").css({
            display : "block"
        });
    
        var slider_wrapper = $(html_element).find(".slider-wrapper");
        var slider_label = $(html_element).find(".slider-label");
        var slider_bg = $(html_element).find(".slider-bg");
        var slider_fg = $(html_element).find(".slider-fg");
        var slider_value = $(html_element).find(".slider-value");
        var slider_input = $(html_element).find("input");
        var W = slider_wrapper.width();
        var H = slider_wrapper.height();
        slider_wrapper.css({
            position    : "absolute",
            width       : "100%",
            height      : "100%",
            top         : "0",
            left        : "0",
            "border-left" : "1px solid #444",
            "border-top" : "1px solid #444",
            "border-bottom" : "1px solid #111",
            "border-right" : "1px solid #111",
            "background-color" : "#222"
        });
        slider_label.css({
            position    : "absolute",
            width       : "20%",
            height      : "40%",
            "margin-top" : "auto",
            "margin-bottom" : "auto",
            left        : "0%",
            right        : "0%",
            top         : "0%",
            bottom         : "0%",
            padding     : "0.2em",
            "font-family" : "sans-serif",
            "font-size" : "100%",
            "text-align"  : "center",
            "margin-right" : "1em",
            "-webkit-touch-callout": "none",
            "-webkit-user-select": "none",
            "-khtml-user-select": "none",
            "-moz-user-select": "none",
            "-ms-user-select": "none",
            "user-select": "none"
        });
        var handler_resize = function(emitter, evt){
            var W = slider_wrapper.width();
            slider_label.css("font-size", (W*0.05).toString()+"px");
        };
        handler_resize();
        window.addEventListener("resize", function(evt){
            handler_resize(this, evt)
        });
        
        slider_bg.css({
            "background-color"   : "#244",
            position    : "absolute",
            height      : "76%",
            top         : "0%",
            bottom      : "0%",
            left        : "20%",
            right       : "3%",
            "margin-left"    : "4px",
            "margin-right"    : "4px",
            "margin-top"    : "auto",
            "margin-bottom"    : "auto",
            "border-top" : "1px solid #111",
            "border-bottom" : "1px solid cyan",
            "background": "-webkit-linear-gradient(rgba(0,0,255,255),rgba(0,255,255,0.3))",
            "background": "-o-linear-gradient(rgba(0,255,255,0),rgba(0,255,255,0.3))",
            "background": "-moz-linear-gradient(rgba(0,255,255,0),rgba(0,255,255,0.3))",
            "background": "linear-gradient(rgba(0,255,255,0), rgba(0,255,255,0.3))",
        });
        slider_fg.css({
            "background-color"   : "cyan",
            position    : "absolute",
            width       : ((this.value*100)|0).toString()+"%",
            height      : "100%",
            top         : "0%",
            left        : "0%",
        });
        slider_value.css({
            display : "none",
            position    : "absolute",
            height      : "76%",
            top         : "0%",
            bottom      : "0%",
            right       : "2px",
            left        : "90%",
            "margin-right"    : "2px",
            "margin-left"    : "2px",
            "margin-top"    : "auto",
            "margin-bottom"    : "auto",
            "background-color"   : "#222"
        });
        slider_input.css({
            "background-color"   : "#222",
            border      : "0px solid black",
            position    : "absolute",
            width       : "100%",
            height      : "100%",
            top         : "0%",
            left        : "0%"
        });

        // Add label
        $(slider_label).html("<span>"+label+"</span>");
        // Setup cursor
        $(slider_bg).css("cursor","e-resize");

        // Event detection 
        var handler_1 = function(emitter, evt){
            evt.preventDefault();
            var offset = $(emitter).offset();
            var x = evt.clientX - offset.left; 
            var val = x/$(emitter).width();
            thiswidget.setValue(val);
        };
        var handler_2 = function(emitter, evt){
            $(slider_bg).on("mousemove", function(evt){
                handler_1(this, evt); 
            });
            $(slider_bg).on("mouseup", function(evt){
                $(slider_bg).unbind("mousemove"); 
            });
            /*
            $(slider_bg).on("mouseleave", function(evt){
                $(slider_bg).unbind("mousemove"); 
            });
            */
        };
        $(slider_bg).on("click", function(evt){
            handler_1(this, evt);
        });
        $(slider_bg).on("mousedown", function(evt){
            handler_2(this, evt);
        });
        //TODO
        var touchstart = function(evt){
        };
        //slider_fg[0].addEventListener("touchstart", touchstart, false);
        //slider_fg[0].addEventListener("touchend", touchend, false);
        //slider_fg[0].addEventListener("touchmove", touchmove, false);
        //var handler_4 = function(emitter, evt){
            //$(slider_bg).on("touchmove", function(evt){
                //handler_1(this, evt); 
            //});
            //$(slider_bg).on("touchend", function(evt){
                //$(slider_bg).unbind("touchmove"); 
            //});
        //};
        //$(slider_bg).on("touchstart", function(evt){
            //handler_4(this, evt);
        //});
        
        // Update
        var update = function(val){
            this.value = Math.min(Math.max(val,0.0),1.0);
            slider_fg.css("width", ((this.value*100)|0).toString()+"%");  
        };
        this.update = update;
    }; 
    Slider.prototype = Object.create(event0.EventEmitter.prototype);
    Slider.prototype.setValue = function(val_raw, do_not_emit){
        // Sets slider value (between 0.0 and 1.0)
        var val = Math.max(Math.min(val_raw,1.0),0.0);
        // If emit = false, do not emit event
        if (!do_not_emit){
            this.emit("set", val);
        }
        this.update(val);
    };
    Slider.prototype.getValue = function(){
        return this.value;
    };

    /**
     * BUTTON
     */
    var Button = function(html_element, label){
        var thiswidget = this;

        // State
        this.value = true;

        // Build html
        $(html_element).append('<div class="button-wrapper"><div class="button-bg"><div class="button-fg"></div></div><div class="button-label"></div></div>'); 

        $(html_element).css({
            color   : "white",
            "text-align" : "center"
        });
        var H = $(html_element).height();
        var W = $(html_element).width();
        var button_wrapper = $(html_element).find(".button-wrapper");
        var button_bg = $(html_element).find(".button-bg");
        var button_fg = $(html_element).find(".button-fg");
        var button_label = $(html_element).find(".button-label");
        button_wrapper.css({
            position: "relative",
            width   : "100%",
            height  : "100%",
            "background-color" : "#222",
            "border-left"  : "1px solid #444",
            "border-top"   : "1px solid #444",
            "border-bottom"   : "1px solid #111",
            "border-right"   : "1px solid #111"
        });
        button_bg.css({
            position: "relative",
            height  : "100%"
        });
        button_fg.css({
            position: "absolute",
            height  : "80%",
            left    : "10%",
            right   : "10%",
            top     : "0",
            bottom  : "0",
            margin  : "auto",
            "border-top" : "1px solid #111",
            "border-bottom"   : "1px solid magenta",
            "background": "-webkit-linear-gradient(rgba(255,0,255,0),rgba(255,0,255,0.2))",
            "background": "-o-linear-gradient(rgba(255,0,255,0),rgba(255,0,255,0.2))",
            "background": "-moz-linear-gradient(rgba(255,0,255,0),rgba(255,0,255,.0.2))",
            "background": "linear-gradient(rgba(255,0,255,0), rgba(255,0,255,0.2))"
        });
        button_label.html("<span>"+label+"</span>");
        button_label.css({
            "font-family" : "sans-serif",
            "font-size"   : (W*0.25).toString()+"px",
            "text-alignt" : "center",
            "margin-top" : "2px",
            "background-color": "#222",
            "border-left" : "1px solid #111",
            "border-right" : "1px solid #222",
            "border-bottom" : "1px solid #111",
            "border-top" : "1px solid #222"
        });
        window.addEventListener("resize", function(){
            var W = $(html_element).width();
            button_label.css("font-size", (W*0.25).toString()+"px");
        });
        // Setup cursor
        $(button_bg).css("cursor","pointer");

        // Event detection
        var handler_1 = function(emitter, evt){
            evt.preventDefault();
            thiswidget.setValue(!thiswidget.value);
        };
        button_fg.on("click", function(evt){
            handler_1(this, evt);
        });

        // Update
        var update = function(val){
            this.value = val;
            button_fg.css("background-color", val? "magenta" : "#424");
        };
        this.update = update;
    };
    Button.prototype = Object.create(event0.EventEmitter.prototype);
    Button.prototype.setValue = function(val, do_not_emit){
        // Sets button value (true or false)
        // If emit = false, do not emit event
        if (!do_not_emit){
            this.emit("set", val);
        }
        this.update(val);
    };

    /**
     * BANG (Trigger button)
     */
    var Bang = function(html_element, label){
        var thiswidget = this;

        // Build html
        $(html_element).append('<div class="bang-wrapper"><div class="bang-bg"><div class="bang-fg"></div></div><div class="bang-label"></div></div>'); 

        $(html_element).css({
            color   : "white",
            "text-align" : "center"
        });
        var H = $(html_element).height();
        var W = $(html_element).width();
        var bang_wrapper = $(html_element).find(".bang-wrapper");
        var bang_bg = $(html_element).find(".bang-bg");
        var bang_fg = $(html_element).find(".bang-fg");
        var bang_label = $(html_element).find(".bang-label");
        bang_wrapper.css({
            position: "relative",
            width   : "100%",
            height  : "100%",
            "background-color" : "#222",
            "border-left"  : "1px solid #444",
            "border-top"   : "1px solid #444",
            "border-bottom"   : "1px solid #111",
            "border-right"   : "1px solid #111"
        });
        bang_bg.css({
            position: "relative",
            height  : "100%"
        });
        bang_fg.css({
            position: "absolute",
            height  : "80%",
            left    : "10%",
            right   : "10%",
            top     : "0",
            bottom  : "0",
            margin  : "auto",
            "border-top" : "1px solid #111",
            "border-bottom"  : "1px solid magenta",
            "background": "-webkit-linear-gradient(rgba(255,0,255,0),rgba(255,0,255,0.2))",
            "background": "-o-linear-gradient(rgba(255,0,255,0),rgba(255,0,255,0.2))",
            "background": "-moz-linear-gradient(rgba(255,0,255,0),rgba(255,0,255,.0.2))",
            "background": "linear-gradient(rgba(255,0,255,0), rgba(255,0,255,0.2))"
            
        });
        bang_label.html("<span>"+label+"</span>");
        bang_label.css({
            "font-family" : "sans-serif",
            "font-size"   : (W*0.25).toString()+"px",
            "text-alignt" : "center",
            "margin-top" : "2px",
            "background-color": "#222",
            "border-left" : "1px solid #111",
            "border-right" : "1px solid #222",
            "border-bottom" : "1px solid #111",
            "border-top" : "1px solid #222"
        });
        var handler_resize = function(emitter, evt){
            var W = $(html_element).width();
            bang_label.css("font-size", (W*0.25).toString()+"px");
        };
        handler_resize();
        window.addEventListener("resize", function(evt){
            handler_resize(this, evt);
        });
        // Setup cursor
        $(bang_bg).css("cursor","pointer");

        // Event detection
        var handler_1 = function(emitter, evt){
            evt.preventDefault();
            thiswidget.bang();
        };
        var handler_2 = function(val){
            bang_fg.css({
                "background-color" : val? "magenta" : "#424"
            });
        };
        handler_2(false);
        bang_fg.on("click", function(evt){
            handler_1(this, evt);
        });
        bang_fg.on("mousedown", function(evt){
            handler_2(true);
        });
        bang_fg.on("mouseleave", function(evt){
            handler_2(false);
        });
        bang_fg.on("mouseup", function(evt){
            handler_2(false);
        });

        // Update
        var update = function(){
            // No state to update for a bang widget
        };
        this.update = update;
    };
    Bang.prototype = Object.create(event0.EventEmitter.prototype);
    Bang.prototype.bang = function(){
        // Simple single trigger
        // If emit = false, do not emit event
        this.emit("bang", null);
        this.update();
    };

    return {
        Slider  : Slider,
        Button  : Button,
        Bang    : Bang
    };
});
