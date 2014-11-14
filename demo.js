$(function(){
  var $startTime = $('#startTime');
  var $relative = $('#relative');
  var $stopTime = $('#stopTime');
  var $start = $('#start');
  var $pause = $('#pause');
  var $stop = $('#stop');
  var $step = $('#step');
  var $steps = $('#steps');
  var timeFormat = 'MMMM Do YYYY, h:mm:ss a';

  // Create my chronometer instance
  var chronometer = new Chronometer();

  // When start, update the DOM startTime
  chronometer.addEventListener('started', function(){
    var humanTime = moment(this.startTime).format(timeFormat);
    $startTime.text(humanTime);
    $stopTime.text('');
    $relative.text('');
    if (!this.steps.length){
      $steps.empty();
    }
  });

  function updateButtons(){
    // Update buttons according to the chronometer state
    var state = this.state;
    $start.prop('disabled', state === Chronometer.prototype.RUNNING);
    $pause.prop('disabled', state !== Chronometer.prototype.RUNNING);
    $stop.prop('disabled', state === Chronometer.prototype.STOPPED);
    $step.prop('disabled', state !== Chronometer.prototype.RUNNING);
  }
  updateButtons.apply(chronometer);

  // When state change, update the buttons
  chronometer.addEventListener('state', updateButtons);

  // When stopped, update the DOM stopTime
  chronometer.addEventListener('stopped', function(){
    var humanTime = moment(this.stopTime).format(timeFormat);
    $stopTime.text(humanTime);
    $relative.text(moment(this.elipsedTime).format('mm:ss.SSS'));
  });

  // When update delegate to relative DOM element
  chronometer.addEventListener('updated', function (){
    $relative.text(moment(this.elipsedTime).format('mm:ss.SSS'));
  });

  // Show steps on the DOM
  chronometer.addEventListener('stepinserted', function (event){
    var $currentStep = $('<li></li>');

    var elipsed = moment( this.elipsedTime ).format('mm:ss.SSS');
    var date = moment( this.steps[this.steps.length - 1].pauseTime ).format(timeFormat);
    $currentStep.text(elipsed + ' at ' + date);
    $steps.append($currentStep);
  });


  // Buttons actions
  $start.on('click', function(){
    chronometer.start();
  });
  $pause.on('click', function(){
    chronometer.pause();
  });
  $stop.on('click', function(){
    chronometer.stop();
  });
  $step.on('click', function(){
    chronometer.step();
  });
  window.chronometer = chronometer;
});
