/**
 * This file is part of event0.js
 * (Javascript Event-Emitter-Receiver implementation with a twist)
 * https://github.com/aluarosi/event0.js
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


/**
SUMMARY:
    We deal with events, emitters, receivers and listeners.
    Both emitter and receiver are objects. When certain conditions happen
    in a emitter object, this emits an event, which is a message sent through
    a listener function. 
    The event has:
        * event_type. Listeners register or 'subcribe' for a type of event;
        * event_data (the message itself, it can be a reference to an object).
    When an event of event_type is emitted, all the functions previously 
    registered for that event_type are called sequentially, with event_data
    as an argument. A reference to the event_emitter is also passed to the 
    listener function (wether as an additional argument or injected into the 
    function as the 'this' variable).
    The listener can be bound to the emitter object (as usual in other framework
    as jquery and nodejs) or to the receiver object with extended methods 
    (addListenerX() and its equivalent onX()).
    
    **Case 1** (Like in jquery and nodejs. Listener bound to emitter).
    EMITTER-(calls)->listener()                                    RECEIVER
    The listener is bound to the emitter, as if it were a method.
    The receiver would be called indirectly if it is an object, but often 
    it is a closure context.
    
    **Case 2** (extended. Listener bound to receiver).
    EMITTER-(calls)----------------------------------->listener()->RECEIVER
    The listener is now a method of the RECEIVER.
    This case makes it easier to call a listener when it is a method 
    of another object.
 */

define(function(){
    EventEmitter = function(){} 

    EventEmitter.prototype.addListener = function(event_type, listener){
    /**
    * Adds listener bound to the emitter object:
    *   'this' inside this function will be bound to the event emiiter
    *   as usual in other js frameworks (jquery, nodejs).
    */
        if (this._listeners === undefined) {
            this._listeners = {};
        }
        if (this._listeners[event_type] === undefined) {
            this._listeners[event_type] = []; 
        }
        if (this._listeners[event_type].indexOf(listener) === -1) {
            this._listeners[event_type].push( listener );
        }
    }
    EventEmitter.prototype.insertListener = function(event_type, listener){
    /**
    * Adds listener bound to the emitter object at the BEGINNING of the listeners array:
    *   'this' inside this function will be bound to the event emiiter
    *   as usual in other js frameworks (jquery, nodejs).
    */
        if (this._listeners === undefined) {
            this._listeners = {};
        }
        if (this._listeners[event_type] === undefined) {
            this._listeners[event_type] = []; 
        }
        if (this._listeners[event_type].indexOf(listener) === -1) {
            this._listeners[event_type].unshift( listener );
        }
    }
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function(event_type, listener){
        var thisemitter = this;
        var wrapped_listener = function(event_data){
            // 1st detach the wrapped listener, then call the original listener 
            // 'this' should have been injected here by the emit function
            // but just in case, we call the "outer this"
            thisemitter.removeListener(event_type, wrapped_listener);
            listener.call(thisemitter, event_data);
        };
        this.on(event_type, wrapped_listener);
    };

    EventEmitter.prototype.addListenerX = function(event_type, listener){
    /** 
    * Adds listener bound to the receiver object:
    *   'this' inside this function will be bound to the event emiiter.
    *   The receiver function must previously be linked to the receiver object
    *   by using the receiver_function.bind(receiver_object) method.
    *   In this case, the emitter passes a reference to itself as the 
    *   1st parameter of the function. 
    * 
    *   Watch Out! Unlike normal listeners, bound functions can be 
    *   added as listeners more than once! (See below).
    */
        if (this._listenersX === undefined) {
            this._listenersX = {};
        }
        if (this._listenersX[event_type] === undefined) {
            this._listenersX[event_type] = []; 
        }
        if (this._listenersX[event_type].indexOf(listener) === -1) {
            // This does not work here as the bound functions deriving 
            // from the same function and bound object are DIFFERENT.
            this._listenersX[event_type].push( listener );
        }
    }
    EventEmitter.prototype.onX = EventEmitter.prototype.addListenerX; 
    
    EventEmitter.prototype.emit = function(event_type, event_data){
    /**
    * When events are emitted, the listeners are called differentely 
    *  depending on how they have been registered. 
    *  Listeners registered in the usual way - with addListener() or on() - 
    *  are called:
    *      listener.call(this, event_data) 
    *  where 'this' is the event emitter injected into the listener function.
    *  Listeners registered in the "extended" way - with addListenerX() or onX() -
    *  are called:
    *      listener(event_emitter, event_data)
    */ 
        // Call _listeners
        if (this._listeners !== undefined && this._listeners[event_type] !== undefined){
            for (var i=0; i<this._listeners[event_type].length; i++) {
                // X listeners are called bound to the emitter
                this._listeners[event_type][i].call(this, event_data);   
            }
        }
        // Call _listenersX
        if (this._listenersX !== undefined && this._listenersX[event_type] !== undefined){
            for (var i=0; i<this._listenersX[event_type].length; i++) {
                // X listeners are called without bounding them to the emitter
                //  as they are already bound to the listener
                this._listenersX[event_type][i](this, event_data);   
            }
        }
    }
    
    EventEmitter.prototype.removeListener = function(event_type, listener){
    /**
    * Removes listener from the list
    */
        if (this._listeners === undefined) {
            return;
        }
        if (this._listeners[event_type] === undefined) {
            return;
        }
        var index = this._listeners[event_type].indexOf(listener);
        if (index !== -1) {
            this._listeners[event_type].splice(index,1);
        }
    }

    EventEmitter.prototype.removeListeners = function(event_type){
    /**
    * Removes all listeners from the list
    */
        if (this._listeners === undefined) {
            return;
        }
        if (this._listeners[event_type] === undefined) {
            return;
        }
        this._listeners[event_type] = [];
    }
    
    EventEmitter.prototype.removeListenerX = function(event_type, listener){
    /**
    * Removes listener from the list
    */
        if (this._listenersX === undefined) { 
            return;
        } 
        if (this._listenersX[event_type] === undefined) {
            return;
        }
        var index = this._listenersX[event_type].indexOf(listener);
        if (index !== -1) {
            this._listenersX[event_type].splice(index,1);
        }
    }

    //Exports
    return {
        EventEmitter: EventEmitter
    };
});

