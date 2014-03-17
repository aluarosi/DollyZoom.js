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

// camera_driver
define(['event0','three','tweenjs'], function(event0, three, tween){
    // Tween is not imported as require.js, but in global space 
    //   under name "createjs"
    var Tween = createjs.Tween;
    var Ease = createjs.Ease;
    

    var SimpleDriver = function(camera, app, spec){
        var thisobject = this;
        //Validate spec
        var spec = typeof spec !== "undefined" ? spec : {};
        
        // Camera and App
        this.camera = camera;
        this.app = app;

        // Origin->Destination for tween'ed params
        this.origin = this.camera.position;
        this.destination = spec.destination || new THREE.Vector3(-1,-1,-1);
        this.target_orig = new THREE.Vector3(0,0,0);
        this.target_dest = new THREE.Vector3(0,0,0);
        this.fovZ_orig = 1;
        this.fovZ_dest = 1;

        this.duration = 1.0;
        this.camtween = camera;
        this.tweenparam = {t:0.0};

        this.receiveRenderBound = null;

    };

    SimpleDriver.prototype = Object.create(event0.EventEmitter.prototype);
    SimpleDriver.prototype.go = function(duration, ease){
        console.log("camera driver go");
        var thisobject = this;
        // 1st reset the tween and remove the final callback if still exists
        this.tweenparam.t = 0.0;
        this.app.removeListenerX('render', this.receiveRenderBound); 
        // 
        this.duration = duration || this.duration;
        this.origin = this.camera.position.clone();
        // Attach itself to acti0 app 'render' event
        this.receiveRenderBound = this.receiveRender.bind(this);
        this.app.onX('render', this.receiveRenderBound);
        // Tween
        this.camtween = Tween.get(thisobject.tweenparam).to(
            {t: 1.0}, 
            thisobject.duration,
            Ease.quadInOut 
        ).call(function(){
            // End of the tween! 
            // Disconnect from tick
            thisobject.app.removeListenerX('render', thisobject.receiveRenderBound);
            thisobject.emit('done', thisobject);
        });
    };
    SimpleDriver.prototype.stop = function(){
        
    };
    SimpleDriver.prototype.set = function(spec){
        var spec = typeof spec !== "undefined" ? spec : {};
        this.origin = spec.origin || this.camera.position;
        this.destination = spec.destination || this.origin;
        this.target_orig = spec.target_orig || this.getInitialTarget();
        this.target_dest = spec.target_dest || this.target_orig;
        this.fovZ_orig = spec.fovZ_orig || this.convertFovToZ(this.camera.fov);
        this.fovZ_dest = spec.fovZ_dest || this.fovZ_orig;
    };
    SimpleDriver.prototype.clear = function(){
        
    };
    SimpleDriver.prototype.update = function(delta){
        Tween.tick(delta);
        var tau = this.tweenparam.t; 
        // Tween position
        this.camera.position = this.origin.clone().add(
            this.destination.clone().sub(this.origin).multiplyScalar(tau)
        );     
        // Tween target
        var target = this.target_orig.clone().add(
            this.target_dest.clone().sub(this.target_orig).multiplyScalar(tau)
        );
        this.camera.lookAt(target);
        // Tween fov
        var fovZ = this.fovZ_orig + (
            (this.fovZ_dest - this.fovZ_orig)*tau
        );
        // Emit 'update-fov' event so that views can display fov changes
        this.emit('update-fov', fovZ);
        this.camera.fov = this.convertZToFov(fovZ);
        this.camera.updateProjectionMatrix();
        // TODO: camera.target has to be included in the tween too!!!
    };
    SimpleDriver.prototype.receiveRender = function(app, delta){
        this.update(delta);
    };

    // Aux methods
    SimpleDriver.prototype.convertFovToZ = function(fov){
        return 1/(2*this.camera.aspect*Math.tan(fov/2*(Math.PI/180)));
    };
    SimpleDriver.prototype.convertZToFov = function(fovZ){
        return 2*Math.atan2(1,2*this.camera.aspect*fovZ) * (180/Math.PI)
    };
    SimpleDriver.prototype.getInitialTarget = function(){
        /**
            If original target is not provided, this function
            calculates one for the initial camera position
            - Camera pointing vector is in camera matrix, 
                3rd column (elements 8,9,10 are coords x,y,z)
            - One possible camera target would be:
                camera_position - camera_vector * K
         */
        
        var camera_target_vector = new THREE.Vector3(
            this.camera.matrix.elements[8],
            this.camera.matrix.elements[9],
            this.camera.matrix.elements[10]
        );
        // Let's assume camera is pointing (focusing) 2.0m away
        var focused_distance = 2.0; 
        var current_target = this.camera.position.clone().sub( 
            camera_target_vector.multiplyScalar(focused_distance)  
        );
        return current_target;
    };

    return {
        SimpleDriver  :   SimpleDriver
    };
});
