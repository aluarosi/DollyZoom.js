/**
 * This file is part of ongoing.js
 * A JavaScript library for handling a?sync tasks.
 * https://github.com/aluarosi/ongoing.js
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

// ongoing.js
define(['event0'], function(event0){

    var Task = function(_task_instructions, _fail_instructions, thisapp){
        /**
            @param   task_instructions -> function(prev_result, call_when_done, call_if_fail)
            @param   fail_instructions -> function(prev_failure, call_when_done, call_if_fail)
            (both bound to "this" task)
            @param   thisapp -> reference to app context, injected into the task

            @event  'done'
            @event  'fail'    
            @event  'cancel' 
            @event  'progress'
            @event  'cleanup'   --> Internal event to cleanup the setup & connections
            @event  'error'     --> Emitted if some error happens (this is different from 'fail')
         */
         /**
            Task states flow:
            INITIAL -->(go)--> STARTED
            INITIAL -->(cancel)--> CANCELED
            STARTED -->(done)--> COMPLETED
            STARTED -->(error)--> FAILED
            COMPLETED -->(cancel)--> CANCELED
            FAILED -->(cancel)--> CANCELED
            CANCELED -->(reset)--> INITIAL
            * -->(*)--> emit/raise error (rest of transitions should not happen) 
        */
        var thistask = this;
        this.thisapp = thisapp;
        this.taskname = "unnamed task";
    
        // TODO: add task name in constructor, so that it helps in debugging!!!!
        
        // If no task_instructions function is specified, then bypass
        var task_instructions = _task_instructions || function(result, cwd, cif){
            cwd(result); 
        };
        // If no fail_instructions function is specified, then relay the failure
        var fail_instructions = _fail_instructions || function(failure, cwd, cif){
            cif(failure); 
        };

        // Emit events only once
        // States: 
        // TODO: let's see if we can get by without a State Pattern
        var STATES = ["initial","started","completed","failed","canceled"];
        var state = "initial";
    
        // Stored RESULT and FAILURE
        this.result = null;
        this.failure = null;
        // What handler was used? Normal (with result) or catch (with failure)?
        this.is_catch = false;


        // Aux functions not to duplicate code
        var do_when_done = function(result){
            if (state === "started") {
                state = "completed";
                //console.log("Task ["+thistask.taskname+"] completed");
                thistask.result = result;
                thistask.emit('cleanup'); // We need to cleanup 1st, otherwise a new go() of a next task could be called before cleanup
                thistask.emit('done', result);
            } else {
                // This function should not be called if not in "started" state
                thistask.emit("error", 
                    "ERROR in task ["+thistask.taskname+"]: function [do_when_done] called in wrong state ["+state+"]"
                );
            }
        };
        var do_when_fail = function(failure){
            if (state === "started") {
                state = "failed";
                //console.log("Task ["+thistask.taskname+"] failed");
                thistask.failure = failure;
                thistask.emit('cleanup'); // TODO: is better before or after 'done'?
                thistask.emit('fail', failure);
            } else {
                thistask.emit("error", 
                    "ERROR in task ["+thistask.taskname+"]: function [do_when_fail] called in wrong state ["+state+"]"
                );
            }
        };

        this.go = function(prev_result){
            // Method to be called with a result from the previous task
            if (state !== "initial") {
                thistask.emit("error", 
                    "ERROR in task ["+thistask.taskname+"]: method [go] called in wrong state ["+state+"]"
                );
                return;
            } else {
                state = "started";
                //console.log("Task ["+thistask.taskname+"] started");
            };
            var task_instructions_bound = task_instructions.bind(thistask);
            task_instructions_bound(
                prev_result, 
                do_when_done,
                do_when_fail
            );
            return this; 
        };

        this.catch = function(prev_failure){
            // Method to be called with a failure from the previous task
            if (state !== "initial") {
                thistask.emit("error", 
                    "ERROR in task ["+thistask.taskname+"]: method [catch] called in wrong state ["+state+"]"
                );
                return;
            } else {
                state = "started";
                //console.log("Task ["+thistask.taskname+"] started (catch)");
            };
            thistask.is_catch = true;
            var fail_instructions_bound = fail_instructions.bind(thistask);
            fail_instructions_bound(
                prev_failure,
                do_when_done,
                do_when_fail
            );
            return this;
        };

        this.cancel = function(){
            if (state === "started") {
                thistask.emit('cleanup'); 
            };
            state = "canceled";
            //console.log("Task ["+thistask.taskname+"] canceled");
            thistask.emit('cancel'); 
        };

        this.reset = function(){
            // In order reset can be used for any task's state, we do this:
            //  (1) --> cancel the task (call thistask.cancel)
            //  /2) --> reset  (reset state attributes and emit "cancel" event)
            // It is the responsability of the task's user to cleanup all objects/listeners, etc so that
            //  garbage does not pile up!!!
            // To avoid cascade effects, we do not call .cancel() if task is already in canceled state

            if (state !== "canceled") {
                thistask.cancel();
            }
            state = "initial";
            thistask.result = null;
            thistask.failure = null;
            thistask.is_catch = false;
            thistask.emit("reset");
        };

        this.clone = function(){
            // Intended to safely reuse the same task again (instead of resetting)
            return new Task(task_instructions, fail_instructions);
        };


        // Task aggregation methods
        this.next = function(t){
            /**
                @param      next task to be executed sequentiallly
                @return     next task  
            */ 

            // First we see if task is resolved and and then we handle it synchronously
            // TODO: should we do this with "next"? To recover result/failure from a resolved task?
            // Probably makes sense, if we attach a next task to a task in a triggered chain,
            // We cannot know if the task we want to attach to has been reached yet, so such a next behaviour
            // would be OK.
            // IN this context, we need to be sure that the next task is not started, but the initial
            //  task to which we attach could be in any state, even resolved.
            // In addition, we can add many next tasks (like with fork)

            // First connect with listeners, no matter what state the task is (it could be reset)
            this.on("done", function(result){
                t.go(result);
            });            
            this.on("fail", function(failure){
                t.catch(failure);
            });            
            this.on("cancel", function(){
                t.cancel();
            });            
            this.on("reset", function(){
                t.reset();
            });            
            if (state === "completed") {
                t.go(this.result);
            } else if (state === "failed") {
                t.catch(this.failure);
            } else if (state === "canceled") {
                t.cancel();
            }
            return t;
        };
        this.fork = function(t){
            /**
                @param      next task to be executed in parallel
                @return     this task
            */ 
            // fork should be the same as next but returning the initial task
            this.next(t);
            return this;
            // TODO: check and test this
        };

        // Generic error handler --> Throws error all the way up if there is no specific error listeners
        this.on("error", function(error_msg){
            if ( this._listeners.error.length <= 1 ) {
                // If no custom listeners for error exist, we throw an exception
                throw error_msg;
            }
        });
    };

    // Task extends EventEmitter
    Task.prototype = Object.create(event0.EventEmitter.prototype);
    Task.prototype.name = function(name){
        // Give a name to the task (helper for debugging)
        this.taskname = name;
        return this;
    };

    // Polymorphic factory function and holder (like jquery)
    var task = function(task_instructions, fail_instructions, thisapp){
        return new Task(task_instructions, fail_instructions, thisapp);
    };
    // Attach components 
    task.all = function(task_list){
        /**
            @param      task list, waits for all to be successfully completed
            @return     a new waiting task
        */ 
    };
    task.any = function(task_list){
        /**
            @param      task list, waits for any of them to be successfully completed
            @return     a new waiting task
        */ 
    };
    task.wrap = function(t_init, t_end){
        /**
            Returns a super-task wrapping an aggregate of tasks
            @param      t_init  initial task
            @param      t_end   end task
            @return     a new task
        */ 
    };


    return task; // task is polymorphic and besides a factory function, holds the module
});
