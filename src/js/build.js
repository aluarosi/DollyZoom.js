/**
This file is for building the optimized single javascript file from
all the modules.

Follow the instructions in http://requirejs.org/docs/optimization.html

General guidelines:
+ Nodejs is required.
> npm install -g requirejs
Run the optimizer:
> r.js -o <this file> 
 */

({
    baseUrl: "./",
    paths: {
        jquery  : "lib/jquery",
        three   : "lib/three_r63",
        orbitpan    : "lib/OrbitAndPanControls.new",
        datgui  : "lib/dat.gui.min",
        tweenjs : "lib/tweenjs",
        kinetic : "lib/kinetic",
        d3      : "lib/d3"
    },
    name: "main",
    out: "main-built.js"
})

