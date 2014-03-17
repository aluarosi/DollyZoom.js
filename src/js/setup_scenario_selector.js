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

// setup_scenario_selector
define(['event0','jquery'], function(event0,jquery){

    var ScenarioSelectorDriver = function(html_element){

        var thisdriver = this;

        // View update
        var update = function(selected_scenario){
            console.log("scenario selected",selected_scenario);

            // TODO: change by CSS3 filter (grayscale, for instance)
            $(html_element).children("img").css("border", "0px");
            $(html_element).children("img").eq(selected_scenario-1).css("border", "1px solid green");
        }; 
        this.update = update;

        // Event detection
        $(html_element).children("a").on("click", function(evt){
            var scenario_idx = $(html_element).children("a").index(this) + 1;
            console.log("click",evt, scenario_idx);
            thisdriver.selectScenario(scenario_idx);
            evt.preventDefault(); 
        });
        $(html_element).children("a").on("mousedown", function(evt){
            evt.preventDefault(); 
            $(this).children("img").css("border","2px solid green");
        });
        $(html_element).children("a").on("mouseup", function(evt){
            evt.preventDefault(); 
            $(this).children("img").css("border","2px solid black");
        });
         

    };
    ScenarioSelectorDriver.prototype = Object.create(event0.EventEmitter.prototype);
    ScenarioSelectorDriver.prototype.selectScenario = function(selected_scenario){
        // Takes an integer as parameter (1,2,3...)
        // (1) Change state --> (2) Emit event --> (3) Update selector view
        // ASH__> this is not needed! // this.selected = selected_scenario;
        this.emit("selected", selected_scenario);
        this.update(selected_scenario);
    };

    var setup_scenario_selector = function(thisapp){
        console.log("setup_scenario_selector");

        var scenario_selector_driver = new ScenarioSelectorDriver(thisapp.shared.html_scenario_selector);
        thisapp.share(scenario_selector_driver, "scenario_selector_driver");
    };
    return setup_scenario_selector;
});
