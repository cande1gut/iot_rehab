var $$ = Dom7;

//Sens object info
var sensSensor = {
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
var rPlateSensor = {
  deviceId: "88:4A:EA:2D:AD:F3",
  serviceUUID: "ffe0",
  txCharacteristic: "ffe1",
  rxCharacteristic: "ffe1"
};

var lPlateSensor = {
  deviceId: "88:C2:55:1C:6E:78",
  serviceUUID: "ffe0",
  txCharacteristic: "ffe1",
  rxCharacteristic: "ffe1"
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
  pushState: true
});
//F7 initialization

var sens, rPlate, lPlate, grip, saveData, bodyPart, dataWindow = 1, windows = 1, sensorData, sensorData2, sensorData3, calibrationValues;
$$(document).on('deviceready', function(){
  //Sens object initialization, pairing and reading
  sens = {
    refreshDeviceList: function(){
      if (cordova.platformId === 'android') { // Android filtering is broken
        ble.scan([], 5, sens.androidDiscover, sens.onError);
      }
      else
      {
        ble.scan([sensSensor.serviceUUID], 5, sens.onDiscoverDevice, sens.onError);
      }
    },
    androidDiscover: function(){
      ble.scan([sensSensor.serviceUUID], 5, sens.onDiscoverDevice, sens.onError);
      //ble.connect(metawear.deviceId, sens.onConnect, sens.onError);
    },
    onDiscoverDevice: function(device){
      if(device.id == sensSensor.deviceId)
      {
        //console.log("found");
        sens.connect(device.id);
      }
    },
    connect: function(id){
      sens.deviceId = id;

      var onConnect = function() {
        changeToConnected();
        //console.log("onConnect");
        sens.startListening(sens.subscribeForIncomingData, sens.onError);
      };

      ble.connect(sens.deviceId, onConnect, sens.onError);
    },
    onData: function(buffer){ // data received from MetaWear
      var data = new Uint16Array(buffer, 0, 5);
      console.log(data);
    },
    writeData: function(buffer, success, failure){ // to to be sent to MetaWear
      if(!failure)
      {
        failure = sens.onError;
      }
      sens.setFrequency();
      ble.writeWithoutResponse(sens.deviceId, sensSensor.serviceUUID, sensSensor.txCharacteristic, buffer, success, failure);
    },
    subscribeForIncomingData: function(){
      ble.startNotification(sens.deviceId, sensSensor.serviceUUID, sensSensor.rxCharacteristic, sens.onData, sens.onError);
    },
    setFrequency: function(){
      var data = new Uint8Array(1);
      data[0] = 0x46;
      ble.write(sens.deviceId, sensSensor.serviceUUID, sensSensor.txCharacteristic, data.buffer);
    },
    startListening: function(success, failure){
      var data = new Uint8Array(7);
        data[0] = 0x03; // module accelerometer
        data[1] = 0x03; //
        data[2] = 0x00; //
        data[3] = 0x00;
        data[4] = 0x20; //
        data[5] = 0x00;
        data[6] = 0x00;

        sens.writeData(data.buffer);

        //track x
        var datax = new Uint8Array(3);
        datax[0] = 0x03; // module accelerometer
        datax[1] = 0x02; //
        datax[2] = 0x01; // start
        sens.writeData(datax.buffer);
        //track y
        var datay = new Uint8Array(3);
        datay[0] = 0x03; // module accelerometer
        datay[1] = 0x04; //
        datay[2] = 0x01; // start
        sens.writeData(datay.buffer);
        //track z
        var dataz = new Uint8Array(3);
        dataz[0] = 0x03; // module accelerometer
        dataz[1] = 0x01; //
        dataz[2] = 0x01; // start
        sens.writeData(dataz.buffer);
    },
    disconnectSens: function(){
      ble.disconnect(sensSensor.deviceId);
      changeToScanning();
    },
    onError: function(reason){
      console.log("ERROR: " + JSON.stringify(reason)); // real apps should use notification.alert
    }
  };
  //Sens object initialization, pairing and reading

  //Plates object initialization, pairing and reading
  rPlate = {
    refreshDeviceList: function(){
      if (cordova.platformId === 'android'){
        ble.scan([], 5, rPlate.androidDiscover, rPlate.onError);
      }
      else
      {
        ble.scan([rPlateSensor.serviceUUID], 5, rPlate.onDiscoverDevice, rPlate.onError);
      }
    },
    androidDiscover: function(){
      ble.scan([rPlateSensor.serviceUUID], 5, rPlate.onDiscoverDevice, rPlate.onError);
    },
    onDiscoverDevice: function(device){
      if(device.id == rPlateSensor.deviceId)
      {
        rPlate.connect(device.id);
      }
    },
    connect: function(id){
      rPlate.deviceId = id;

      var onConnect = function() {
        changeToConnected();
        /*var frequency = new Uint8Array(1);
        frequency[0] = 0x46;
        ble.write(rPlate.deviceId, rPlateSensor.serviceUUID, rPlateSensor.txCharacteristic, frequency.buffer);*/
        rPlate.startListening(rPlate.subscribeForIncomingData, rPlate.onError);
      };

      ble.connect(rPlate.deviceId, onConnect, rPlate.onError);
    },
    onData: function(buffer){
      var data = new Uint16Array(buffer, 0, 5);
      var runningMeasure1 = data[1];
      var runningMeasure2 = data[2];
      var measureWithoutForce1 = 3582;
      var measureWithoutForce2 = 3800;
      var coeff = 0.036121;

      //back of the plate
      var force1 = Math.abs(runningMeasure1-measureWithoutForce1)*coeff;
      //front of the plate
      var force2 = Math.abs(runningMeasure2-measureWithoutForce2)*coeff;

      var forceStr1 = force1.toString();
      var forceStr2 = force2.toString();

      //back
      var forceNum1 = forceStr1.slice(0, (forceStr1.indexOf("."))+3);
      //front
      var forceNum2 = forceStr2.slice(0, (forceStr2.indexOf("."))+3);

      if(parseFloat(forceNum1) >= 1 && saveData){
        sensorData.push(parseFloat(forceNum1));
      }
      if(parseFloat(forceNum2) >= 1 && saveData){
        sensorData2.push(parseFloat(forceNum2));
      }

      console.log("Back: " + forceNum1);
      console.log("Front: " + forceNum2);

    },
    writeData: function(buffer, success, failure){
      if(!failure)
      {
        failure = rPlate.onError;
      }
      rPlate.setFrequency();
      ble.writeWithoutResponse(rPlate.deviceId, rPlateSensor.serviceUUID, rPlateSensor.txCharacteristic, buffer, success, failure);
    },
    subscribeForIncomingData: function(){
      ble.startNotification(rPlate.deviceId, rPlateSensor.serviceUUID, rPlateSensor.rxCharacteristic, rPlate.onData, rPlate.onError);
    },
    setFrequency: function(){
      var data = new Uint8Array(1);
      data[0] = 0x46;
      ble.write(rPlate.deviceId, rPlateSensor.serviceUUID, rPlateSensor.txCharacteristic, data.buffer);
    },
    startListening: function(success, failure){
      var data = new Uint8Array(1);
      data[0] = 0x11;
      rPlate.writeData(data.buffer, success, failure);
    },
    disconnectPlateR: function(){
      ble.disconnect(rPlateSensor.deviceId);
      changeToScanning();
    },
    onError: function(reason){
      console.log("ERROR: " + JSON.stringify(reason)); // real apps should use notification.alert
    }
  };

  lPlate = {
    refreshDeviceList: function(){
      if (cordova.platformId === 'android'){
        ble.scan([], 5, lPlate.androidDiscover, lPlate.onError);
      }
      else
      {
        ble.scan([lPlateSensor.serviceUUID], 5, lPlate.onDiscoverDevice, lPlate.onError);
      }
    },
    androidDiscover: function(){
      ble.scan([lPlateSensor.serviceUUID], 5, lPlate.onDiscoverDevice, lPlate.onError);
    },
    onDiscoverDevice: function(device){
      if(device.id == lPlateSensor.deviceId)
      {
        lPlate.connect(device.id);
      }
    },
    connect: function(id){
      lPlate.deviceId = id;

      var onConnect = function() {
        changeToConnected();
        lPlate.startListening(lPlate.subscribeForIncomingData, lPlate.onError);
      };

      ble.connect(lPlate.deviceId, onConnect, lPlate.onError);
    },
    onData: function(buffer){
      var data = new Uint16Array(buffer, 0, 5);
      var runningMeasure1 = data[1];
      var runningMeasure2 = data[2];
      var measureWithoutForce1 = 3838;
      var measureWithoutForce2 = 3700;
      var coeff = 0.036121;

      //back of the plate
      var force1 = Math.abs(runningMeasure1-measureWithoutForce1)*coeff;
      //front of the plate
      var force2 = Math.abs(runningMeasure2-measureWithoutForce2)*coeff;

      var forceStr1 = force1.toString();
      var forceStr2 = force2.toString();

      //back
      var forceNum1 = forceStr1.slice(0, (forceStr1.indexOf("."))+3);
      //front
      var forceNum2 = forceStr2.slice(0, (forceStr2.indexOf("."))+3);

      if(parseFloat(forceNum1) >= 1 && saveData){
        sensorData.push(parseFloat(forceNum1));
      }
      if(parseFloat(forceNum2) >= 1 && saveData){
        sensorData2.push(parseFloat(forceNum2));
      }

      console.log("Back: " + forceNum1);
      console.log("Front: " + forceNum2);
    },
    writeData: function(buffer, success, failure){
      if(!failure)
      {
        failure = lPlate.onError;
      }
      lPlate.setFrequency();
      ble.writeWithoutResponse(lPlate.deviceId, lPlateSensor.serviceUUID, lPlateSensor.txCharacteristic, buffer, success, failure);
    },
    subscribeForIncomingData: function(){
      ble.startNotification(lPlate.deviceId, lPlateSensor.serviceUUID, lPlateSensor.rxCharacteristic, lPlate.onData, lPlate.onError);
    },
    setFrequency: function(){
      var data = new Uint8Array(1);
      data[0] = 0x46;
      ble.write(lPlate.deviceId, lPlateSensor.serviceUUID, lPlateSensor.txCharacteristic, data.buffer);
    },
    startListening: function(success, failure){
      var data = new Uint8Array(1);
      data[0] = 0x11;
      lPlate.writeData(data.buffer, success, failure);
    },
    disconnectPlateL: function(){
      ble.disconnect(lPlateSensor.deviceId);
      changeToScanning();
    },
    onError: function(reason){
      console.log("ERROR: " + JSON.stringify(reason)); // real apps should use notification.alert
    }
  };
  //Plates object initialization, pairing and reading

  //Grip object initialization, pairing and reading
  grip = {
    refreshDeviceList: function(){
      if (cordova.platformId === 'android'){
        ble.scan([], 5, grip.androidDiscover, grip.onError);
      }
      else
      {
        ble.scan([gripSensor.serviceUUID], 5, grip.onDiscoverDevice, grip.onError);
      }
    },
    androidDiscover: function(){
      ble.scan([gripSensor.serviceUUID], 5, grip.onDiscoverDevice, grip.onError);
    },
    onDiscoverDevice: function(device){
      if(device.id == gripSensor.deviceId)
      {
        grip.connect(device.id);
      }
    },
    connect: function(id){
      grip.deviceId = id;

      var onConnect = function() {
        changeToConnected();
        grip.startListening(grip.subscribeForIncomingData, grip.onError);
      };

      ble.connect(grip.deviceId, onConnect, grip.onError);
    },
    onData: function(buffer){
      var data = new Uint16Array(buffer, 0, 5);
      var runningMeasure = data[1];
      var measureWithoutForce = 63998;
      var coeff = 0.004;
      var force = Math.abs(runningMeasure-measureWithoutForce)*coeff;
      var percentage = force/35;
      var forceStr = force.toString();
      var forceNum = forceStr.slice(0, (forceStr.indexOf("."))+3);

      if(parseFloat(forceNum) >= 1 && saveData){
        sensorData.push(parseFloat(forceNum));
      }

      warmupGauge.update({
        value: percentage,
        valueText: forceNum
      });
    },
    writeData: function(buffer, success, failure){
      if(!failure)
      {
        failure = grip.onError;
      }
      grip.setFrequency();
      ble.writeWithoutResponse(grip.deviceId, gripSensor.serviceUUID, gripSensor.txCharacteristic, buffer, success, failure);
    },
    subscribeForIncomingData: function(){
      ble.startNotification(grip.deviceId, gripSensor.serviceUUID, gripSensor.rxCharacteristic, grip.onData, grip.onError);
    },
    setFrequency: function(){
      var data = new Uint8Array(1);
      data[0] = 0x46;
      ble.write(grip.deviceId, gripSensor.serviceUUID, gripSensor.txCharacteristic, data.buffer);
    },
    startListening: function(success, failure){
      var data = new Uint8Array(1);
      data[0] = 0x11;
      grip.writeData(data.buffer, success, failure);
    },
    disconnectGrip: function(){
      ble.disconnect(gripSensor.deviceId);
      changeToScanning();
    },
    onError: function(reason){
      console.log("ERROR: " + reason); // real apps should use notification.alert
    }
  };
  //Grip object initialization, pairing and reading
  console.log("Device is ready!");
});

//Login screen
$$("#login-button").on('click', function(){
  var toastBottom = app.toast.create({
    text: 'Wrong Name or Password',
    closeTimeout: 2000,
  });
  //formData["login-password"]
  //formData["login-name"]
  var formData = app.form.convertToData('#login-form');
  app.request.post('http://142.244.87.239:8080/vibrantminds2/api/token_login', { "username": formData["login-name"], "password": formData["login-password"] }, function (data) {
    //Login Auth
    mainView.router.navigate({
      name: 'calibration',
    });
    //Login Auth
  }, function (error){
    toastBottom.open();
  });
  //console.log(mainView.router.history);
});
//Login screen

$$(document).on('page:init', '.page[data-name="register"]', function (e) {
  //Register new user screen
  $$("#register-button2").on('click', function(){
    var formData = app.form.convertToData('#register-form');
    //alert(JSON.stringify(formData));
    /*app.request.setup({
      headers: {
        'Authorization': '52ddf7495c9f3da8b9ccd873163a7b300eb606e7'
      }
    });
    app.request.post('http://142.244.87.239:8080/vibrantminds2/api/participants',
      {
        "is_participant": true,
        "participant_info": {
          "firstname": formData["register-name"],
          "email": formData["register-email"],
          "gender": formData["register-gender"],
          "age": formData["register-age"],
          "bmi": formData["register-bmi"],
          "height": formData["register-height"],
          "weight": formData["register-weight"],
          "physical_energy": formData["register-energy"],
          "bed_time": formData["register-bed"],
          "physical_frequency": formData["register-physical"],
          "medical_conditions": formData["register-conditions"]
        },
        "username": formData["register-name"],
        "password": formData["register-password"]
      },
      function (data) {
      console.log(data);
    });*/
    /*app.request.post('http://142.244.87.239:8080/vibrantminds2/api/token_login', { "username":"participant1", "password": "123test123" }, function (data) {
      console.log(data);
    });*/
    /*if(formData){
      mainView.router.navigate({
        name: 'calibration',
      });
    }*/
  });
  //Register new user screen
});

$$(document).on('page:init', '.page[data-name="criteria"]', function (e) {
  //Register new user screen
  $$("#save-button").on('click', function(){
    var formData = app.form.convertToData('#criteria-form');
    //alert(JSON.stringify(formData));
  });
  //Register new user screen
});

//Register screen
$$("#register-button").on('click', function(){
  //Register Auth
  mainView.router.navigate({
    name: 'register',
  });
  //Register Auth
});

//Register screen

function calculateBMI(){
  var m2 = Math.pow($$("#height-value").val(), 2);
  var bmi = $$("#weight-value").val() / m2;
  var bmiStr = bmi.toString();
  var bmiNum = bmiStr.slice(0, (bmiStr.indexOf("."))+3);
  if(m2 == 0 || bmi == 0 || bmi == null || m2 == null){
    $$('#bmi-value').val(0);
  }
  else{
    $$('#bmi-value').val(bmiNum);
  }
}

//Global variables
var calibrationGauge,
    warmupGauge,
    timerGauge,
    warmupTimer,
    intialTimer,
    round = 1,
    assessment1,
    assessment2,
    assessmentTitle,
    sensor;
//Global variables

//Calibration screen
$$(document).on('page:init', '.page[data-name="calibration"]', function (e) {
  calibrationValues = {};

  app.request.get('http://142.244.87.239:8080/vibrantminds2/api/events', function (data) {
    var events = JSON.parse(data);
    //console.log(events["results"]);
  });

  $$(".calibration-sensor").on("click", function(e){
    if($$(this).attr('data-sensor') == "sens"){
      sensor = "sens";
      sens.refreshDeviceList();
    }
    else if($$(this).attr('data-sensor') == "plateR"){
      sensor = "plateR";
      rPlate.refreshDeviceList();
    }
    else if($$(this).attr('data-sensor') == "plateL"){
      sensor = "plateL";
      lPlate.refreshDeviceList();
    }
    else if($$(this).attr('data-sensor') == "grip"){
      sensor = "grip";
      grip.refreshDeviceList();
    }
    bodyPart = $$(this).attr('data-part');
  });

  app.on("cardOpen", function(expendableCard){
    $$("#calibration-fab").hide();
    if($$("#calibration-page").scrollTop() == 0){
      app.navbar.toggleLargeTitle("#calibration-nav");
    }
    $$("#"+expendableCard.id+"-reset").on('click', function(){
      if(expendableCard.id == "sens-card"){

      }
      else if(expendableCard.id == "plates-card"){
        $$("#lFoot, #rFoot").html("No Data");
        calibrationValues['lFoot'] = null;
        calibrationValues['rFoot'] = null;
      }
      else if(expendableCard.id == "grip-card"){
        $$("#lHand, #rHand").html("No Data");
        calibrationValues['lHand'] = null;
        calibrationValues['rHand'] = null;
      }
      $$("#"+expendableCard.id+"-col").html('<i id='+expendableCard.id+'-icon class="calibration-icon icon f7-icons color-red">multiply_circle_fill</i>');
    });
  });

  app.on("cardClose", function(expendableCard){
    $$("#calibration-fab").show();
    if($$("#calibration-page").scrollTop() == 0){
      app.navbar.toggleLargeTitle("#calibration-nav");
    }
  });

});

$$(document).on('page:afterout', '.page[data-name="calibration"]', function (e) {
  if(sensor == "sens"){
    changeToMode2();
    $$("#assessment-popover").attr('data-popover', ".popover-"+sensor);
    //sens.disconnectSens();
  }
  else if(sensor == "plateR"){
    changeToMode2();
    $$("#assessment-popover").attr('data-popover', ".popover-plates");
    //rPlate.disconnectPlateR();
  }
  else if(sensor == "plateL"){
    changeToMode2();
    $$("#assessment-popover").attr('data-popover', ".popover-plates");
    //lPlate.disconnectPlateL();
  }
  else if(sensor == "grip"){
    changeToMode1();
    $$("#assessment-popover").attr('data-popover', ".popover-"+sensor);
    //grip.disconnectGrip();
  }
});

$$(document).on('page:afterin', '.page[data-name="calibration"]', function (e) {
  assessmentTitle = "Sensor Calibration";
  if(calibrationValues['lFoot'] != null && calibrationValues['rFoot'] != null){
    var id = "#plates-card";
    $$(id+"-col").html('<i id='+id+'-icon class="calibration-icon icon f7-icons color-green">checkmark_alt_circle_fill</i>');
  }
  else if(calibrationValues['rHand'] != null && calibrationValues['lHand'] != null){
    var id = "#grip-card";
    $$(id+"-col").html('<i id='+id+'-icon class="calibration-icon icon f7-icons color-green">checkmark_alt_circle_fill</i>');
  }
});
//Calibration screen

//Timed assessment screen functions
function initialState(){
  calibrationGauge.update({
    el: '#calibration-gauge',
    type: 'circle',
    value: 0.5,
    size: 250,
    borderColor: '#2196f3',
    borderWidth: 10,
    valueText: '0%',
    valueFontSize: 41,
    valueTextColor: '#2196f3',
    labelText: 'Completed',
  });

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
  changeToStart();
  sensorData = [];
  sensorData2 = [];
  sensorData3 = [];

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
  $$("#start-assessment").addClass("color-green");
}

function changeToScanning(){
  disableStartButton();
  $$("#device-pairing").css("display", "block");
  $$("#device-connected").css("display", "none");
}

function changeToConnected(){
  enableStartButton();
  $$("#device-pairing").css("display", "none");
  $$("#device-connected").css("display", "block");
}

function changeToMode1(){
  $$("#timer-gauge").css("display", "initial");
  $$("#warmup-gauge").css("display", "initial");
  $$("#calibration-gauge").css("display", "none");
}

function changeToMode2(){
  $$("#timer-gauge").css("display", "none");
  $$("#warmup-gauge").css("display", "none");
  $$("#calibration-gauge").css("display", "initial");
}

function changeToSave(){
  $$("#start-assessment").css("display", "none");
  $$("#save-calibration").css("display", "block");
}

function changeToStart(){
  $$("#start-assessment").css("display", "block");
  $$("#save-calibration").css("display", "none");
}

function turnOffSensor(){
  if(sensor == "sens"){
    sens.disconnectSens();
  }
  else if(sensor == "plateR"){
    rPlate.disconnectPlateR();
  }
  else if(sensor == "plateL"){
    lPlate.disconnectPlateL();
  }
  else if(sensor == "grip"){
    grip.disconnectGrip();
  }
}

function getCalibration(){
  if(sensor == "sens"){

  }
  else if(sensor == "plateR"){
    //console.log("data-------------");
    var back = sensorData;
    var front = sensorData2;
    if(back.length%10 != 0){
      back = back.slice(0, -(back.length%10));
    }
    if(front.length%10 != 0){
      front = front.slice(0, -(front.length%10));
    }
    //console.log(data.length);
    //console.log("sma-------------");
    var medianFilter = sma(back, 10);
    var medianFilter2 = sma(front, 10);
    //console.log(average);
    //console.log("avg-------------");
    var sortedMedian = quickSort(medianFilter, 0, medianFilter.length-1);
    var sortedMedian2 = quickSort(medianFilter2, 0, medianFilter2.length-1);
    var average = median(sortedMedian);
    var average2 = median(sortedMedian2);
    //console.log(average2);
    //console.log(average3);
    return [average, average2];
  }
  else if(sensor == "plateL"){
    //console.log("data-------------");
    var back = sensorData;
    var front = sensorData2;
    if(back.length%10 != 0){
      back = back.slice(0, -(back.length%10));
    }
    if(front.length%10 != 0){
      front = front.slice(0, -(front.length%10));
    }
    //console.log(data.length);
    //console.log("sma-------------");
    var medianFilter = sma(back, 10);
    var medianFilter2 = sma(front, 10);
    //console.log(average);
    //console.log("avg-------------");
    var sortedMedian = quickSort(medianFilter, 0, medianFilter.length-1);
    var sortedMedian2 = quickSort(medianFilter2, 0, medianFilter2.length-1);
    var average = median(sortedMedian);
    var average2 = median(sortedMedian2);
    //console.log(average2);
    //console.log(average3);
    return [average, average2];
  }
  else if(sensor == "grip"){
    //console.log("data-------------");
    var data = sensorData;
    if(data.length%10 != 0){
      data = data.slice(0, -(data.length%10));
    }
    //console.log(data.length);
    //console.log("sma-------------");
    var medianFilter = sma(data, 10);
    //console.log(average);
    //console.log("avg-------------");
    var sortedMedian = quickSort(medianFilter, 0, medianFilter.length-1);
    var average = median(sortedMedian);
    //console.log(average2);
    //console.log(average3);
    return average;
  }
}

function median(values){
  //values.sort( function(a,b) {return a - b;} );
  var half = Math.floor(values.length/2);
  if(values.length % 2){
    return values[half];
  }
  else{
    return (values[half-1] + values[half]) / 2.0;
  }
}
//Timed assessment screen functions

//Timed assessment screen
$$(document).on('page:mounted', '.page[data-name="assessment"]', function (e) {
  //$$("#assessment-screen-title").html(assessmentTitle);
  $$("#assessment-screen-title").html(assessmentTitle);
});

$$(document).on('page:beforein', '.page[data-name="assessment"]', function (e) {

});

$$(document).on('page:init', '.page[data-name="assessment"]', function (e) {
  saveData = true;
  sensorData = [];
  sensorData2 = [];
  sensorData3 = [];

  //Gauges initialization
  calibrationGauge = app.gauge.create({
    el: '#calibration-gauge',
    type: 'circle',
    value: 0,
    size: 250,
    borderColor: '#2196f3',
    borderWidth: 10,
    valueText: '0%',
    valueFontSize: 41,
    valueTextColor: '#2196f3',
    labelText: 'Completed',
  });

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
    onstart : function() {
                saveData = true;
              },
    ontick  : function(ms) {
                var seconds = ((ms % 60000) / 1000).toFixed(0);
                var timePercentage = seconds / 10;
                timerGauge.update({
                  value: timePercentage,
                  valueText: seconds
                });

                var progress = 11-seconds;
                var progressPercentage = progress/10;
                calibrationGauge.update({
                  value: progressPercentage,
                  valueText: progress*10 + '%'
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
                  //resetStartLabel();
                  enableResetButton();
                  changeToSave();
                }
                else{
                  round++;
                  changeLabels();
                }
                saveData = false;
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
    turnOffSensor();
  });

  $$("#start-assessment").on('click', function(){
    disableStartButton();
    intialTimer.start(intialTime);
  });

  $$("#reset-assessment").on('click', function(){
    initialState();
  });

  $$("#save-calibration").on('click', function(){
    var numberCalibrated = getCalibration();
    changeToSave();
    mainView.router.back();
    turnOffSensor();
    calibrationValues[bodyPart] = numberCalibrated;
    if(bodyPart == "rFoot" || bodyPart == "lFoot"){
      var total = parseFloat(numberCalibrated[0]) + parseFloat(numberCalibrated[1]);
      $$("#" + bodyPart).html("Front: " + numberCalibrated[0] + ", Back: " + numberCalibrated[1] + "<br>" + "Total: " + total);
    }
    else if(bodyPart == "rHand" || bodyPart == "lHand"){
      $$("#" + bodyPart).html(numberCalibrated);
    }
  });
});

$$(document).on('page:afterout', '.page[data-name="assessment"]', function (e) {
  initialState();
  changeToScanning();
  /*for(var key in calibrationValues) {
    var value = calibrationValues[key];
    console.log(key);
    console.log(value);
    console.log("-------");
  }*/
});
//Timed assessment screen

//Programs screen
$$(document).on('page:init', '.page[data-name="programs"]', function (e) {
  app.sheet.create({
    el: '.exercise1-swipe-to-close',
    swipeToClose: true,
    backdrop: true,
  });
  app.sheet.create({
    el: '.exercise2-swipe-to-close',
    swipeToClose: true,
    backdrop: true,
  });
  app.sheet.create({
    el: '.exercise3-swipe-to-close',
    swipeToClose: true,
    backdrop: true,
  });

  $$(".program-assessment").on("click", function(){
    console.log("this");
    if($$(this).attr('data-sensor') == "sens"){
      sens.refreshDeviceList();
      changeToMode2();
    }
    else if($$(this).attr('data-sensor') == "plates"){
      rPlate.refreshDeviceList();
      lPlate.refreshDeviceList();
      changeToMode2();
    }
    else if($$(this).attr('data-sensor') == "grip"){
      grip.refreshDeviceList();
      changeToMode1();
    }
  });
});

$$(document).on('page:beforein', '.page[data-name="programs"]', function (e) {
  assessmentTitle = "Program";
});
//Programs screen
var score1 = Math.floor(Math.random() * 101)+1;
var score2 = Math.floor(Math.random() * 101)+1;
var score3 = Math.floor(Math.random() * 101)+1;
var score4 = Math.floor(Math.random() * 101)+1;
var score5 = Math.floor(Math.random() * 101)+1;

var score6 = Math.floor(Math.random() * 101)+1;
var score7 = Math.floor(Math.random() * 101)+1;
var score8 = Math.floor(Math.random() * 101)+1;
var score9 = Math.floor(Math.random() * 101)+1;
var score10 = Math.floor(Math.random() * 101)+1;
//Stats screen
$$(document).on('page:init', '.page[data-name="stats"]', function (e) {

  $$("#frailty-chip").html('<div class="chip-label">'+frailtyStatus+'</div>');
  console.log(frailtyStatus);
  if(frailtyStatus == "Frail"){
    $$("#frailty-chip").removeClass("color-orange");
    $$("#frailty-chip").removeClass("color-green");
    $$("#frailty-chip").addClass("color-red");
  }
  else if(frailtyStatus == "Pre-Frail"){
    $$("#frailty-chip").addClass("color-orange");
    $$("#frailty-chip").removeClass("color-green");
    $$("#frailty-chip").removeClass("color-red");
  }
  else if(frailtyStatus == "Not Frail"){
    $$("#frailty-chip").removeClass("color-orange");
    $$("#frailty-chip").addClass("color-green");
    $$("#frailty-chip").removeClass("color-red");
  }

  var friedCanvas = $$("#fried-canvas")[0].getContext('2d');
  var chart = new Chart(friedCanvas, {
  type: 'radar',
  data: {
    labels: ['Shrinking', 'Endurance', 'Activity', 'Weakness', 'Slow walking speed'],
    datasets: [
      {
        data: [score1, score2, score3, score4, score5],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgb(255, 99, 132)',
        fill: false,
        label: 'Current Progress',
        lineTension: 0
      },
      {
        data: [score6, score7, score8, score9, score10],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgb(54, 162, 235)',
        fill: false,
        label: 'Last Week Progress',
        lineTension: 0
      }
    ],
  },
  options: {
    scale: {
      ticks: {
        beginAtZero: true
      }
    },
    title: {
      display: true,
      fontSize: 18,
      position: 'right',
      text: 'Frailty Comparisson'
    }
  }
});
  /*var friedAssessment = new Chart(friedCanvas, {
    type: 'radar',
    data: {
        labels: ['Weight loss', 'Weakness', 'Exhaustion', 'Slowness', 'Low physical activity'],
        datasets: [{
            data: [Math.abs(bmi-bmi2), 10, 4, 2, 20]
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
  });*/

});
//Stats screen

//Assessment of criterias
var bmi, grip, gripMetrics, gender, bmi2, bed, physical, walking, height;
function generateRandomNumber() {
  var min = 20,
      max = 30,
      randomBmi = Math.random() * (max - min) + min;
      bmi = parseFloat(randomBmi.toFixed(2));
      //console.log(bmi);
  var min2 = 15,
      max2 = 35,
      randomGrip = Math.random() * (max2 - min2) + min2;
      grip = parseFloat(randomGrip.toFixed(2));
      //console.log(grip);
  var genderRandom = Math.floor(Math.random() * 2);
  if(genderRandom == 1){
    gender = "male";
  }
  else{
    gender = "female";
  }
  //console.log(gender);
  var min3 = 20,
      max3 = 30,
      randomBmi2 = Math.random() * (max3 - min3) + min3;
      bmi2 = parseFloat(randomBmi2.toFixed(2));
      //console.log(bmi2);
      bed = Math.floor(Math.random() * 2);
      //console.log(endurance);
      physical = Math.floor(Math.random() * 2);
      walking = Math.floor(Math.random() * 15)*2;
      //console.log(walking);
      var min4 = 150,
          max4 = 174,
          randomHeight = Math.random() * (max4 - min4) + min4;
          height = parseInt(randomHeight);
          //console.log(walking);
};

generateRandomNumber();

var frailtyCounter = 0;
function frailty(){
  if(Math.abs(bmi-bmi2) < 18.5){
    frailtyCounter++;
  }
  if(bed == 1){
    frailtyCounter++;
  }
  if(physical == 1){
    frailtyCounter++;
  }
  if(gender == "male"){
    if(height <= 173 || height > 173 && walking >= 19){
      frailtyCounter++;
    }
  }
  if(gender == "female"){
    if(height <= 159 || height > 159 && walking >= 19){
      frailtyCounter++;
    }
  }
  return frailtyCounter;
}

frailty();

var frailtyStatus = "";
function assessFrailty(){
  if(frailtyCounter >= 3){
    frailtyStatus = "Frail";
  }
  else if(frailtyCounter == 1 || frailtyCounter == 2){
    frailtyStatus = "Pre-Frail";
  }
  else if(frailtyCounter == 0){
    frailtyStatus = "Not Frail";
  }
}
assessFrailty();
//console.log(frailtyStatus);

function gripAssessment(bmi, grip){
  app.request.json('./metrics/grip.json', function(data){
    gripMetrics = data;
    var genderMetrics;
    if(gender == "man"){
      genderMetrics = gripMetrics["man"];
    }
    else{
      genderMetrics = gripMetrics["woman"];
    }

    for(var i=0; i<genderMetrics.length; i++){
      if(i == genderMetrics.length-1){
        if(bmi > genderMetrics[i]["bmi"] && grip <= genderMetrics[i]["strength"]){
          //console.log("index: BMI<=" + genderMetrics[i]["bmi"] + "&" + "Strength<=" + genderMetrics[i]["strength"]);
          frail = true;
          break;
        }
      }
      else if((bmi >= genderMetrics[i]["bmi"][0] && bmi <= genderMetrics[i]["bmi"][1]) && grip <= genderMetrics[i]["strength"]){
        //console.log("index: BMI<=" + genderMetrics[i]["bmi"][1] + " & " + "Strength<=" + genderMetrics[i]["strength"]);
        frail = true;
        break;
      }
    }
  });
}
//gripAssessment(bmi, grip);
//Assessment of criterias
