chronometer.js
==============

This is just a chornometer constructor in JavaScript, that uses ObjectEventTarget as prototype to support events listeners.

[**DEMO PAGE**](http://gartz.github.io/chronometer.js/)

Motivation
----------

I want to create a demo how to use the ObjectEventTarget and inspire other JavaScript programmers to use prototype.

Nothing better then a project that envolves a logical part that can be tottaly separated from the design, and also have it owns events. This will allow you do alot of things, so you also can prototype your function with the chronometer, creating a more sofisticate object.

How to use
----------

You just need to create a instance or more using `new Chronometer()`, then you are good to go.

Methods
-------

**Public methods:**

* **start()**: Start your chronometer
* **stop()**: Stop your chronometer (next time you start, it will reset the properties)
* **pause()**: It will pause your chronometer, addeding a step to it, the time paused is not computed as `elipsedTime`, you can call `start()` to continue tracking the time
* **step()**: It also create a step, but will not pause, very useful if you want to track laps
* **update()**: It will update the values of the `elipsedTime` from global and current step.
* **isRunning()**: Return true when it's running
* **isPaused()**: Return true when it's paused
* **isStopped()**: Return true when it's stopped

**Internal use methods:**

* **createStep( forceTime )**: Return a *ChronometerStep* instance, if `forceTime` is undefined, it will use `Date.now()` as value of `pausedTime`
* **setState()**: Change the state value, when you *start*, *pause* or *stop*.
* **autoUpdate()**: Create a internal recursive timeout to trigger update based on `updateInterval` value.

Properties
----------

** Read-write properties:**

* **updateInterval**: *number* (default: 50) miliseconds between each time `update` will be triggered by the `autoUpdate`.

** Read-only properties:

* **state**: Define the chronometer state using the constants: *RUNNING*, *PAUSED* or *STOPPED*.
* **startTime**: *Timestamp* with register when chronometer start running.
* **stopTime**: *Timestamp* with register when chronometer stop running.
* **steps**: *array* with the `ChronometerStep` instances for each time you *pause* or *step*.
* **elipsedTime**: *number* in miliseconds of the elipsed time from when you started the chronometer, will be updated by any action or *autoUpdate*.

**Internal use properties:**

* **autoUpdateID**: Store the last autoUpdate timeout instance ID.

Events
------

Events are providen by [ObjectEventTarget](https://github.com/gartz/ObjectEventTarget) prototype, means that you can use **addEventListener**, **removeEventListener** or **dispatchEvent** in any instance of *chronometer*.

**Cancelable Events:**

* **start**: Dispatched when is about to start the chronometer.
* **stop**: Dispatched when is about to stop the chronometer.
* **step**: Dispatched when a step is about to be pushed.
* **update**: Dispateched when is about to update the chronometer properties and it steps.

**Non-cancelable Events:**

* **started**: When the chronometer has been started.
* **stopped**: When the chronometer has been stopped.
* **stepinserted**: Everytime a step is pushed in the steps array.
* **updated**: Everytime that the chronometer properties are updated (good if you want to update your DOM)
* **state**: When a state is changed (the `event` contains a `detail` property with the old state value).

Constants
---------

* **STOPPED**
* **RUNNING**
* **PAUSED**

Prototype
---------

To prototype you can call from your new constructor passing your context. 

Example:
```
function FancyChronometer( name ){
    Chronometer.call(this);
    this.name = name;
}
FancyChronometer.prototype = Chronometer.prototype;
```

The advantages of doing by mixing is if the chronometer is updated, your extended constructor will not break, but in a cost of a small loop proprierties mixing.

Architecture
------------

There is no private methods, except by the instance `ChronometerStep` that only can be accessed by `createStep`. The thing is, you have freedom to do whatever you want, even destroy the chronometer.

`Object.defineProperty` isn't been used to protect the read only properties, because I want to be backward compatible with ES3 and because it's more about good sense to don't change it values, but if you need for any misterious reason, you can change it.

`autoUpdateID` is an common example of how prototypes mean to be used if you want to give abbility to prototype any new constructor. If you want to hide it value from the other programmers, the only way is to use a *WeakMap* for that, and keep the methods that depends on it in the prototype, or create the method `autoUpdate` with a closure inside the constructor, but it's more code, memory mess just to protect other programmers from doing mistake with it. Doesn't worth.

If your browser has support to `Object.defineProperties`, it will add all methods as not enumerable, if you do a for in, they will not be iterated. But if you plan to give support to IE-9, use hasOwnProperty or a shim to ensure that behaviour.

Files
-----

* **chrnometer.js**: Chronometer constructor and prototype logic.
* **demo.js**: Used by index.html to create a demo biding in the DOM.
