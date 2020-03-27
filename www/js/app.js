var $$ = Dom7;

//Sens object info
var metawear = {
  deviceId: "F0:25:C2:74:09:A1",
  serviceUUID: "326a9000-85cb-9195-d9dd-464cfbbae75a",
  txCharacteristic: "326a9001-85cb-9195-d9dd-464cfbbae75a",
  rxCharacteristic: "326a9006-85cb-9195-d9dd-464cfbbae75a"
};
//Sens object info

//Grip object info
var gripSensor = {
  deviceId: "80:1F:12:B1:3B:60",
  serviceUUID: "49535343-FE7D-4AE5-8FA9-9FAFD205E455",
  txCharacteristic: "49535343-8841-43F4-A8D4-ECBE34729BB3",
  rxCharacteristic: "49535343-1E4D-4BD9-BA61-23C647249616"
};
//Grip object info

//Plates object info
var rPlate = {
  deviceId: "",
  serviceUUID: "",
  txCharacteristic: "",
  rxCharacteristic: ""
};

var lPlate = {
  deviceId: "",
  serviceUUID: "",
  txCharacteristic: "",
  rxCharacteristic: ""
};
//Plates object info

//F7 initialization
var app = new Framework7({
  root: '#app', // App root element
  name: 'KRehab', // App name
  theme: 'auto', // Automatic theme detection
  routes: routes,
});
var mainView = app.views.create('.view-main', {
  stackPages: true
});
//F7 initialization

//Sens object initialization, pairing and reading
var sens = {
    /*bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        motorButton.addEventListener('click', this.onMotorButton, false);
        buzzerButton.addEventListener('click', this.onBuzzerButton, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },*/
    refreshDeviceList: function(){
      /*if (cordova.platformId === 'android') { // Android filtering is broken
        ble.scan([], 5, sens.androidDiscover, sens.onError);
      }
      else
      {
        ble.scan([metawear.serviceUUID], 5, sens.onDiscoverDevice, sens.onError);
      }*/
      ble.scan([], 20, success, sens.onError);

      function success(d){
        console.log(JSON.stringify(d));
      }

    },
    androidDiscover: function(){
      ble.scan([metawear.serviceUUID], 5, sens.onDiscoverDevice, sens.onError);
      //ble.connect(metawear.deviceId, sens.onConnect, sens.onError);
    },
    onDiscoverDevice: function(device){
      if(device.id == metawear.deviceId)
      {
        //console.log("found");
        sens.connect(device.id);
      }
    },
    connect: function(id){
      sens.deviceId = id;

      var onConnect = function() {
        //console.log("onConnect");
        sens.enableButtonFeedback(sens.subscribeForIncomingData, sens.onError);
      };

      ble.connect(sens.deviceId, onConnect, sens.onError);
    },
    onData: function(buffer){ // data received from MetaWear
      var data = new Uint8Array(buffer);
      var message = "";

      if (data[0] === 1 && data[1] === 1) { // module = 1, opscode = 1
        if (data[2] === 1) { // button state
            message = "Button pressed";
        } else {
            message = "Button released";
        }
      }

      $$("#sens-data").append(message);
      //console.log(message);

      //resultDiv.innerHTML = resultDiv.innerHTML + message + "<br/>";
      $$("#sens-onData").append(
        "<br>" + message + "<br/>"
      );
      //resultDiv.scrollTop = resultDiv.scrollHeight;
    },
    writeData: function(buffer, success, failure){ // to to be sent to MetaWear
      if (!success)
      {
        success = function(){

          $$("#sens-write").append(
            "<br>Sent: " + JSON.stringify(new Uint8Array(buffer)) + "<br/>"
          );
          //resultDiv.scrollTop = resultDiv.scrollHeight;
        };
      }
      else{
        $$("#sens-success").append(
          JSON.stringify(new Uint8Array(buffer)) + "<br/>"
        );
      }

      if(!failure)
      {
        failure = sens.onError;
      }

      ble.writeWithoutResponse(sens.deviceId, metawear.serviceUUID, metawear.txCharacteristic, buffer, success, failure);
    },
    subscribeForIncomingData: function(){
      ble.startNotification(sens.deviceId, metawear.serviceUUID, metawear.rxCharacteristic, sens.onData, sens.onError);
    },
    enableButtonFeedback: function(success, failure){
      var data = new Uint8Array(6);
      data[0] = 0x01; // mechanical switch
      data[1] = 0x01; // switch state ops code
      data[2] = 0x01; // enable

      sens.writeData(data.buffer, success, failure);
    },
    onMotorButton: function(event){
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0x80; // Motor
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x00; // Some magic bullshit

        sens.writeData(data.buffer);
    },
    onBuzzerButton: function(event){
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0xF8; // Buzzer
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x01; // Some magic?

        sens.writeData(data.buffer);
    },
    /*disconnect: function(event) {
        ble.disconnect(app.deviceId, app.showMainPage, app.onError);
        sens.deviceId = "";
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
        resultDiv.innerHTML = "<i>Press the button on the MetaWear</i><br/>";
    },*/
    onError: function(reason){
      alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
//Sens object initialization, pairing and reading

//Grip object initialization, pairing and reading
var grip = {
    /*bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        motorButton.addEventListener('click', this.onMotorButton, false);
        buzzerButton.addEventListener('click', this.onBuzzerButton, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },*/
    refreshDeviceList: function(){
      if (cordova.platformId === 'android') { // Android filtering is broken
        ble.scan([], 5, grip.androidDiscover, grip.onError);
      }
      else
      {
        ble.scan([gripSensor.serviceUUID], 5, grip.onDiscoverDevice, grip.onError);
      }
    },
    androidDiscover: function(){
      ble.scan([gripSensor.serviceUUID], 5, grip.onDiscoverDevice, grip.onError);
      //ble.connect(metawear.deviceId, sens.onConnect, sens.onError);
    },
    onDiscoverDevice: function(device){
      if(device.id == gripSensor.deviceId)
      {
        //console.log("found");
        grip.connect(device.id);
      }
    },
    connect: function(id){
      grip.deviceId = id;

      var onConnect = function() {
        //console.log("onConnect");
        grip.startListening(grip.subscribeForIncomingData, grip.onError);
      };

      ble.connect(grip.deviceId, onConnect, grip.onError);
    },
    onData: function(buffer){ // data received from MetaWear
      var data = new Uint16Array(buffer, 0, 5);
      //console.log(JSON.stringify(data));
      var runningMeasure = data[1];
      var measureWithoutForce = 63998;
      var coeff = 0.004;
      var force = Math.abs(runningMeasure-measureWithoutForce)*coeff;
      var percentage = force/35;
      var forceStr = force.toString();
      var forceNum = forceStr.slice(0, (forceStr.indexOf("."))+3);

      warmupGauge.update({
        value: percentage,
        valueText: forceNum
      });

      //$$("#grip-data").html('<p id="grip-data" class="sensor-data no-margin-vertical">'+force+'</p>');
      //console.log(message);
    },
    writeData: function(buffer, success, failure){ // to to be sent to MetaWear
      /*if (!success)
      {
        success = function(){

          $$("#sens-write").append(
            "<br>Sent: " + JSON.stringify(new Uint8Array(buffer)) + "<br/>"
          );
          //resultDiv.scrollTop = resultDiv.scrollHeight;
        };
      }
      else{
        $$("#sens-success").append(
          JSON.stringify(new Uint8Array(buffer)) + "<br/>"
        );
      }*/

      if(!failure)
      {
        failure = grip.onError;
      }

      ble.writeWithoutResponse(grip.deviceId, gripSensor.serviceUUID, gripSensor.txCharacteristic, buffer, success, failure);
    },
    subscribeForIncomingData: function(){
      ble.startNotification(grip.deviceId, gripSensor.serviceUUID, gripSensor.rxCharacteristic, grip.onData, grip.onError);
    },
    startListening: function(success, failure){
      var data = new Uint16Array(12);
      //var data = new Uint16Array(1);
      data[0] = 0x11;
      //console.log(JSON.stringify(data));

      grip.writeData(data.buffer, success, failure);
    },
    onMotorButton: function(event){
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0x80; // Motor
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x00; // Some magic bullshit

        grip.writeData(data.buffer);
    },
    onBuzzerButton: function(event){
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0xF8; // Buzzer
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x01; // Some magic?

        grip.writeData(data.buffer);
    },
    /*disconnect: function(event) {
        ble.disconnect(app.deviceId, app.showMainPage, app.onError);
        sens.deviceId = "";
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
        resultDiv.innerHTML = "<i>Press the button on the MetaWear</i><br/>";
    },*/
    disconnectGrip: function(){
      ble.disconnect(gripSensor.deviceId);
    },
    onError: function(reason){
      alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
//Grip object initialization, pairing and reading

//Plates object initialization, pairing and reading

//Plates object initialization, pairing and reading

$$(document).on('deviceready', function(){
  //sens.refreshDeviceList();

  //Login screen
  $$("#login-button").on('click', function(){
    //Login Auth
    mainView.router.navigate({
      name: 'calibration',
    });
    //Login Auth
    //console.log(mainView.router.history);
  });
  //Login screen

  //Register screen
  $$("#register-button").on('click', function(){
    //Register Auth
    mainView.router.navigate({
      name: 'register',
    });
    //Register Auth
  });
  //Register screen

  //Calibration screen
  app.on("cardOpen", function(expendableCard){
    $$("#calibration-fab").hide();
    if($$("#calibration-page").scrollTop() == 0){
      app.navbar.toggleLargeTitle("#calibration-nav");
    }
    $$("#"+expendableCard.id+"-save").on('click', function(){
      $$("#"+expendableCard.id+"-icon").remove();
      $$("#"+expendableCard.id+"-col").append('<i id='+expendableCard.id+'-icon class="calibration-icon icon f7-icons color-green">checkmark_alt_circle_fill</i>');
      $$("#"+expendableCard.id+"-save").addClass("disabled");
      $$("#"+expendableCard.id+"-reset").removeClass("disabled");
    });
    $$("#"+expendableCard.id+"-reset").on('click', function(){
      $$("#"+expendableCard.id+"-icon").remove();
      $$("#"+expendableCard.id+"-col").append('<i id='+expendableCard.id+'-icon class="calibration-icon icon f7-icons color-red">multiply_circle_fill</i>');
      $$("#"+expendableCard.id+"-reset").addClass("disabled");
      $$("#"+expendableCard.id+"-save").removeClass("disabled");
    });
  });

  app.on("cardClose", function(expendableCard){
    $$("#calibration-fab").show();
    if($$("#calibration-page").scrollTop() == 0){
      app.navbar.toggleLargeTitle("#calibration-nav");
    }
  });
  //Calibration screen

  console.log("Device is ready!");
});

//Global variables
var warmupGauge, timerGauge, warmupTimer, intialTimer, round = 1, assessmentTitle;
//Global variables

//Timed assessment screen functions
function initialState(){
  warmupGauge.update({
    el: '#warmup-gauge',
    type: 'semicircle',
    size: 250,
    value: 0,
    valueText: '0',
    borderColor: "#4caf50",
    borderWidth: 30,
    labelText: "Kg.",
    //labelTextColor: "",
    labelFontSize: 15,
    labelFontWeight: 30
  });

  timerGauge.update({
    el: '#timer-gauge',
    type: 'circle',
    value: 0,
    valueText: "Ready?",
    size: 100,
    valueFontSize: 30,
    borderColor: "#2196f3",
    borderWidth: 10,
  });

  round = 1;
  disableResetButton();
  changeLabels();

  intialTimer.stop();
  warmupTimer.stop();
}

function enableStartButton(){
  $$("#start-assessment").removeClass("disabled");
  $$("#start-assessment").addClass("button-fill");
}

function disableStartButton(){
  $$("#start-assessment").addClass("disabled");
  $$("#start-assessment").removeClass("button-fill");
}

function enableResetButton(){
  $$("#reset-assessment").removeClass("disabled");
  $$("#reset-assessment").addClass("button-fill");
}

function disableResetButton(){
  $$("#reset-assessment").addClass("disabled");
  $$("#reset-assessment").removeClass("button-fill");
}

function changeLabels(){
  $$("#assessment-screen-round").html("Round " + round);
  enableStartButton();
}

function resetStartLabel(){
  $$("#start-assessment").html("Start");
  $$("#start-assessment").removeClass("color-black");
  $$("#start-assessment").addClass("color-green");
}
//Timed assessment screen functions

//Calibration screen
$$(document).on('page:afterin', '.page[data-name="calibration"]', function (e) {
  assessmentTitle = "Sensor Calibration";
});
//Calibration screen

//Timed assessment screen
$$(document).on('page:mounted', '.page[data-name="assessment"]', function (e) {
  $$("#assessment-screen-title").html(assessmentTitle);
});

$$(document).on('page:init', '.page[data-name="assessment"]', function (e) {
  //Gauges initialization
  warmupGauge = app.gauge.create({
    el: '#warmup-gauge',
    type: 'semicircle',
    size: 250,
    value: 0,
    valueText: '0',
    borderColor: "#4caf50",
    borderWidth: 30,
    labelText: "Kg.",
    labelFontSize: 15,
    labelFontWeight: 30
  });

  timerGauge = app.gauge.create({
    el: '#timer-gauge',
    type: 'circle',
    value: 0,
    valueText: "Ready?",
    size: 100,
    valueFontSize: 30,
    borderColor: "#2196f3",
    borderWidth: 10,
    valueTextColor: '#2196f3'
  });
  //Gauges initialization

  var warmupTime = 11;
  warmupTimer = new Timer({
    tick    : 1,
    ontick  : function(ms) {
                var seconds = ((ms % 60000) / 1000).toFixed(0);
                var timePercentage = seconds/10;
                timerGauge.update({
                  value: timePercentage,
                  valueText: seconds
                });
              },
    onstop  : function(){
                initialState();
              },
    onend   : function() {
                timerGauge.update({
                  value: 0,
                  valueFontSize: 35,
                  valueText: "Finish"
                });
                if(round == 3){
                  resetStartLabel();
                  enableResetButton();
                }
                else{
                  round++;
                  changeLabels();
                }
              }
  });

  var intialTime = 3;
  intialTimer = new Timer({
    tick    : 1,
    onstart : function() {
                timerGauge.update({
                  valueText: "3",
                  valueFontSize: 40,
                  labelText: "Seconds",
                  valueTextColor: '#F1C40F'
                });
              },
    onstop  : function(){
                initialState();
              },
    ontick  : function(ms) {
                var seconds = ((ms % 60000) / 1000).toFixed(0);
                timerGauge.update({
                  valueText: seconds,
                  labelText: "Seconds"
                });
              },
    onend   : function() {
                timerGauge.update({
                  value: 10,
                  valueText: "Go!",
                  valueTextColor: '#2196f3'
                });
                warmupTimer.start(warmupTime);
              }
  });

  $$("#cancel-assessment").on('click', function(){
    grip.disconnectGrip();
  });

  $$("#start-assessment").on('click', function(){
    //grip.refreshDeviceList();
    disableStartButton();
    intialTimer.start(intialTime);
  });

  $$("#reset-assessment").on('click', function(){
    initialState();
  });
});

$$(document).on('page:afterout', '.page[data-name="assessment"]', function (e) {
  initialState();
});
//Timed assessment screen

//Programs screen
$$(document).on('page:beforein', '.page[data-name="programs"]', function (e) {
  assessmentTitle = "Program";
});
//Programs screen

//Stats screen
$$(document).on('page:init', '.page[data-name="stats"]', function (e) {

  var friedCanvas = $$("#fried-canvas")[0].getContext('2d');
  var friedAssessment = new Chart(friedCanvas, {
    type: 'radar',
    data: {
        labels: ['Weight loss', 'Weakness', 'Exhaustion', 'Slowness', 'Low physical activity'],
        datasets: [{
            data: [20, 10, 4, 2, 20]
        }]
    },
    options: {
        scale: {
            angleLines: {
                display: false
            },
            ticks: {
                suggestedMin: 50,
                suggestedMax: 100
            }
        }
    }
  });

});
//Stats screen
