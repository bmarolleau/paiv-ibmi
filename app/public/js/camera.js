/* * * * * * * * * * * * *\
 *   GLOBAL VARIABLES    *
\* * * * * * * * * * * * */

var socket = io();

var video, 
    scale = 0.25,
    timer = 3,
    scale2 = 1,
    emotions = [];

/* * * * * * * * * * * * *\
 *   WHEN PAGE LOADS     *
\* * * * * * * * * * * * */

window.addEventListener("load", function() {

  /* -- STEP 0 -- */

  initialize();   

  /* -- Authorisation to use the video -- */
  navigator.mediaDevices.enumerateDevices()
    .then(gotDevices)
    .catch("errorCallback");

  $('select').on('change', function() {
    chooseCamera($( "select" ).val())
  });

  socket.on('result', function(data) { 
    console.log(data)

    if(data[0].alerte == "error") { // If error is sent back, this means that we are not connected to the firewall
      $("#error").css("display", "block"); 
    } else if(data[0].alerte) { // Only displays square there is an alert
      var squares = [];
      $(".squares").empty();
      for (var i = data.length - 1; i >= 0; i--) {
        squares[i] = ".square" + i;
        $("#error").css("display", "none"); 
        $(".squares").append("<div class='square square" + i + "'></div>"); 

        // Because the size of the video on the web page changes according to the screen, 
        // We need to calculate a scale to position the square at the rigth place 
        // When we send the picture to power AI, we resize it at a scale. SO the result comes at this size
        var videoWidth = parseFloat($(".videoElement").css("width").replace(/[^-\d\.]/g, ''), 10);
        scale2 = videoWidth/(640*scale);
        // Size of the square
        var width  = data[i].xmax*scale2 - (data[i].xmin*scale2);
        var height = data[i].ymax*scale2 - (data[i].ymin*scale2);
        $(squares[i]).css("width", width);  
        $(squares[i]).css("height", height); 

        // Position of the square
        var marginTop = parseFloat($(".videoElement").css("margin-top").replace(/[^-\d\.]/g, ''), 10);
        var marginLeft = parseFloat($(".videoElement").css("margin-left").replace(/[^-\d\.]/g, ''), 10);

        $(squares[i]).css("top", (data[i].ymin * scale2) + marginTop);  
        $(squares[i]).css("left", (data[i].xmin * scale2)+ marginLeft);   
      } 
    } else {
        $("#error").css("display", "none"); 
        $( ".squares" ).empty();
      }
  })

  function chooseCamera (deviceId) {
    console.log(deviceId)
    
    video.setSinkId(deviceId)
    .then(function() {
      console.log('Audio output device attached: ' + deviceId);
    })
    .catch(function(error) {
      // ...
    });
      
    const videoConstraints = {
      // videoConstraints.facingMode = 'environment';};
      "deviceId": { exact: deviceId }
    }
    const constraints = {
      video: videoConstraints,
      audio: false
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
      var videoTracks = stream.getVideoTracks();
      console.log('Using video device: ' + videoTracks[0].label);
      stream.onended = function() {
        console.log('Stream ended');
      };
      
      window.stream = stream; // make variable available to console
      video.srcObject = stream;
    })
    .catch(function(error) {
      // ...
    })
  }

  function gotDevices(deviceInfos) {
    var cameraDisplayed = false;

    for (var i = 0; i !== deviceInfos.length; ++i) {
      if(deviceInfos[i].kind == "videoinput") {
        if (!cameraDisplayed) {
          chooseCamera(deviceInfos[i].deviceId)
          cameraDisplayed = true;
        }
        console.log(deviceInfos[i])
        $(".chooseCamera").append("<option value='" + deviceInfos[i].deviceId +"'>" + deviceInfos[i].label + "</option>");
      }
    }
  }

  // Every 1 seconds (1000ms), the function clickC is called
  window.setInterval(captureImage, 1000);
});


/* * * * * * * * * * * * *\
 *      FUNCTIONS        *
\* * * * * * * * * * * * */

/* -- First function to be called -- */
function initialize () {
  video = $(".videoElement").get(0);
};

/* -- Takes a picture from the video -- */
function captureImage() {
  if($("#checkbox").is(':checked')) {
    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    console.log(video.videoWidth)
    console.log(video.videoHeight)
    canvas.getContext('2d')
      .drawImage(video, 0, 0, canvas.width, canvas.height);
  
    socket.emit("image", canvas.toDataURL());
  } 
 
};
