(function (root){
  'use strict';

  var ObjectEventTarget = root.ObjectEventTarget;
  var ObjectEvent = root.ObjectEvent;

  // jshint node:true
  if (typeof global !== 'undefined'){
    ObjectEventTarget = require('ObjectEventTarget').ObjectEventTarget;
    ObjectEvent = require('ObjectEventTarget').ObjectEvent;
  }

  function ChronometerStep(forceTime){
    // Internal used to populate the steps array

    this.pauseTime = forceTime || Date.now();
    this.unpauseTime = 0;
    this.elipsedTime = 0;
    this.lapTime = 0;
  }
  ChronometerStep.prototype.unpause = function(forceTime){
    // Set the unpause to the current time
    this.unpauseTime = forceTime || Date.now();
  };

  function Chronometer(){
    // A Chronometer can track elipsed time from start to stop
    // Also can store steps in the way, or pause and start from
    // the paused moment, you can get metrics of time with it
    // and it also support events for easy integration with other
    // objects


    if (!(Chronometer.prototype instanceof ObjectEventTarget)){
      // Singleton prototype methods from Chronometer

      // Constants
      this.STOPPED  = 0;
      this.RUNNING = 1;
      this.PAUSED = 2;

      // Public methods:
      this.start = function (){
        // Starts the counter

        if (this.isRunning()){
          return this;
        }

        // You can cancel the start event
        var event = new ObjectEvent('start', {cancelable: true});

        if (!this.dispatchEvent(event)){
          return this;
        }

        // But started can't be canceled
        event = new ObjectEvent('started');

        if (this.isStopped()){
          this.startTime = Date.now();
          this.stopTime = 0;
          this.steps = [];
        }
        if (this.isPaused()){
          if (this.steps.length){
            this.steps[this.steps.length - 1].unpause();
          }
        }
        this.setState(Chronometer.prototype.RUNNING);
        this.dispatchEvent(event);
        return this;
      };
      this.stop = function (){
        // Stops the counter and reset to zero

        if (this.isStopped()){
          return this;
        }

        if (!this.dispatchEvent(new ObjectEvent('stop', {cancelable: true}))){
          return this;
        }

        if (this.isPaused()){
          this.stopTime = this.steps[this.steps.length - 1].pauseTime;
        } else {
          this.stopTime = Date.now();
        }
        this.setState(Chronometer.prototype.STOPPED);
        this.dispatchEvent(new ObjectEvent('stopped'));
        return this;
      };
      this.pause = function (){
        // Pause the counter and add the step to array

        if (!this.isRunning()){
          return this;
        }
        this.steps.push( this.createStep() );
        this.dispatchEvent( new ObjectEvent('stepinserted') );
        this.setState(Chronometer.prototype.PAUSED);

        return this;
      };
      this.step = function (){
        // Add a new step, without changing the state, so you can track a moment
        // Example: a completed lap

        var step = this.createStep(Date.now());
        // Update before add a new step
        this.update();
        if (this.dispatchEvent( new ObjectEvent('step', {cancelable: true, detail: step})) ){
          this.steps.push( step );
          this.dispatchEvent( new ObjectEvent('stepinserted') );
          if (this.steps.length){
            this.steps[this.steps.length - 1].unpause(step.pauseTime);
          }
        }
        return this;
      };
      this.isStopped = function (){
        return this.state === Chronometer.prototype.STOPPED;
      };
      this.isRunning = function (){
        return this.state === Chronometer.prototype.RUNNING;
      };
      this.isPaused = function (){
        return this.state === Chronometer.prototype.PAUSED;
      };

      // Private methods
      this.update = function (){
        // Update the elipsedTime

        // Set next auto update
        this.autoUpdate();

        if (!this.dispatchEvent( new ObjectEvent('update', {cancelable: true})) ){
          return this;
        }
        var elipsedTime = this.startTime;
        var step;
        for (var i = 0, m = this.steps.length; i < m; i++){
          step = this.steps[i];
          if (step.unpauseTime){
            elipsedTime += step.unpauseTime - step.pauseTime;
          }
        }
        elipsedTime = (this.stopTime ? this.stopTime : Date.now()) - elipsedTime;
        this.elipsedTime = elipsedTime;
        if (step){
          step.elipsedTime = elipsedTime;
          var lastStep = this.steps[i - 2];
          if (lastStep){
            step.lapTime = elipsedTime - lastStep.elipsedTime;
          } else {
            step.lapTime = elipsedTime;
          }
        }
        this.dispatchEvent( new ObjectEvent('updated') );
      };
      this.createStep = function (forceTime){
        // Create a step instance to be used in the Chronometer steps

        return new ChronometerStep(forceTime);
      };
      this.setState = function (state){
        // Change between states
        if (this.state === state){
          return this;
        }
        switch(state){
          case Chronometer.prototype.RUNNING:
          case Chronometer.prototype.STOPPED:
          case Chronometer.prototype.PAUSED:
          break;
          default:
            throw new TypeError('Invalid state.');
        }
        var oldState = state;
        this.state = state;
        this.update();
        this.dispatchEvent(new ObjectEvent('state'), {detail: oldState});
        return this;
      };

      this.autoUpdate = function (){
        // Start internal recursive timeout to update the values and trigger
        // update event, if the state change to PAUSED or STOPPED it will clearTimeout
        // and only start again when you start the chronometer.
        // You can change the update interval in the public variable `updateInterval`

        var that = this;
        function bindUpdate(){
          that.update();
        }
        clearTimeout(this.autoUpdateID);
        if (this.isRunning()){
          this.autoUpdateID = setTimeout(bindUpdate, this.updateInterval);
        }
      };
      return this;
    }

    // Initial object state with read only properties
    this.state = Chronometer.prototype.STOPPED;
    this.startTime = 0;
    this.stopTime = 0;
    this.steps = [];
    this.elipsedTime = 0;
    this.autoUpdateID = null;

    // Settings properties

    // Time in miliseconds between each update event is triggered
    this.updateInterval = 50;
  }
  Chronometer.prototype = ObjectEventTarget.prototype;
  Chronometer.prototype = new Chronometer();

  // Prevent enumerable prototype when supported by the browser
  if (Object.defineProperties){
    var definePropertiesArgs = function (prototype){
      var props = {};
      for (var k in prototype) {
        if (prototype.hasOwnProperty(k)) {
          props[k] = {
            value: prototype[k],
            enumerable: false
          };
        }
      }
      return [prototype, props];
    };

    // Chronometer.prototype remove enumerable prototype
    Object.defineProperties.apply(Object, definePropertiesArgs(Chronometer.prototype));
  }

  // Expose to global
  if (typeof window === 'undefined'){
    root = global;
  }
  root.Chronometer = Chronometer;

  // Export as module to nodejs
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = {
      Chronometer: ObjectEventTarget
    };
  }
})(this);
