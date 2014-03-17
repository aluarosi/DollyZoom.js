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

// main
require.config({
    urlBase: "js",
    paths: {
        jquery  : "lib/jquery",
        three   : "lib/three_r63",
        orbitpan    : "lib/OrbitAndPanControls.new",
        datgui  : "lib/dat.gui.min",
        tweenjs : "lib/tweenjs",
        kinetic : "lib/kinetic",
        d3      : "lib/d3"
    }
});

require([   'acti0',
            'setup_view_manager',
            'setup_scene3',
            'setup_control_panel',
            'setup_scenario_selector',
            'setup_controls',
            'setup_displayzoom',
            'setup_infoview',
            'setup_presentation',
            'setup_manager'
            ], 
            function(
                acti0, 
                setup_view_manager,
                setup_scene3,
                setup_control_panel,
                setup_scenario_selector,
                setup_controls,
                setup_displayzoom,
                setup_infoview,
                setup_presentation,
                setup_manager
            ){

    var app = acti0.app;

    // CONFIG
    app.setConfig({
        unity_focal_length  :   36.0,
    }); 
    // SETUP
    app.on('setup', setup_view_manager);
    app.on('setup', setup_scene3);
    app.on('setup', setup_control_panel);
    app.on('setup', setup_scenario_selector);
    //app.on('setup', setup_controls);
    app.on('setup', setup_infoview);
    app.on('setup', setup_presentation);
    app.on('setup', setup_manager);

    // RUN
    app.run();

});
