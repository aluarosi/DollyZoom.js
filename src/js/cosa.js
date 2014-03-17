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

// Cosa 
define(['three'], function(three){

    var Cosa = function(spec){
        if (spec === undefined ) spec = {};
        this.parent3D = null;   // set by build()
        this.pos3D    = null;   // set by build()
        this.object3D = null;   // set by build()
        this.children = {};     // set by constructor
    }
    
    Cosa.prototype = {
        build    :   function(parent3D){
            // Build hierarchy of Object3D hanging from parent3D
            this.parent3D = parent3D;
            this.pos3D    = new THREE.Object3D();
            this.object3D = new THREE.Object3D();
            this.parent3D.add(this.pos3D);
            this.pos3D.add(this.object3D);
            var paint3D = new THREE.Object3D(); 
            this.paint(paint3D);
            this.object3D.add(paint3D);
            this.setPos3D(this.pos3D);
            var children = this.children;
            for ( child in children){
                children[child].build(this.object3D);
            }
        },    
        rebuild     : function(){
            // Replaces this.object3D with a new rebuilt object3D
            this.parent3D.remove(this.pos3D);
            this.build(this.parent3D);
        },
        setPos3D    : function(position_3d){
            // To be overriden by parent "Cosa" object
            // Sets position withing the parent object
            // Override using the parameter and building on and changing it
        }, 
        paint       : function(object_3d){
            // Default method for containers, so it is not needed to define paint() explicitly
            // To be overriden by leaf nodes, using parameter object_3d
            //   changing and modifying it.
        }
    }

    return {
        Cosa    : Cosa
    };
});


