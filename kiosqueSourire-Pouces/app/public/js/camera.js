/* * * * * * * * * * * * *\
 *   GLOBAL VARIABLES    *
\* * * * * * * * * * * * */

var socket = io();

var video, 
    scale = 0.25,
    timer = 3,
    emotions = [];

/* * * * * * * * * * * * *\
 *   WHEN PAGE LOADS     *
\* * * * * * * * * * * * */

window.addEventListener("load", function() {

  /* -- STEP 0 -- */

  // Spinner creation
  var spinner = new Spinner(opts).spin();
  $(".loading").append(spinner.el);

  initialize();   

  /* -- STEP 1 -- */

  $(".button-start").click(function() { 
    emotions = [];
    timer = 0;

    $(".spinner").css("display", "block");
    $(".timer").css("display", "block");
    var w = $(".videoElement").width();  
    var z = $(".videoElement").height();  
    $(".timer").css("top", ((z/2)-5.5));
    $(".timer").css("left", ((w/2)-7)) ;

    $(".emotions").css("display", "block");
    $(".avis").css("display", "none");
    $(".results").css("display", "none");
  }); 


  /* -- STEP 3 -- */
  
  $(".validate").click(function (){
    $(".results").css("display", "none");
    $(".avis").css("display", "flex");
  })

  /* -- Authorisation to use the video -- */

  if (navigator.mediaDevices.getUserMedia) {       
    navigator.mediaDevices.getUserMedia({video: true})
    .then(function(stream) {
      video.srcObject = stream;
    })
    .catch(function(err0r) {
      console.log("Something went wrong!");
    });
  }

  /* -- SOCKET -- */

  socket.on('emotion', function(data) {
    emotions.push(data);
    
    if (data == "up") {
      console.log("like")
      $(".like").addClass("select").removeClass("unselect");
      $(".dislike").addClass("unselect").removeClass("select");
    } else if (data == "down") {
      console.log("neutral")
      $(".like").addClass("unselect").removeClass("select");
      $(".dislike").addClass("select").removeClass("unselect");
    } 
  });

  // Every 1 seconds (1000ms), the function clickC is called
  window.setInterval(clickC, 1000);
});


/* * * * * * * * * * * * *\
 *      FUNCTIONS        *
\* * * * * * * * * * * * */

/* -- Called every second -- */
function clickC() {
  if (timer < 3) { 
    captureImage();
  } else if (timer == 3) {
    if (emotions.length >= 3) {
      timer++;
      validerAvis();
    }
  } else {
    $(".spinner").css("display", "none");
    $(".timer").css("display", "none");
    $(".face").removeClass("flash animated")
    $(".like").addClass("select").removeClass("unselect");
    $(".dislike").addClass("select").removeClass("unselect");
  }
}

/* -- First function to be called -- */
function initialize () {
  video = $(".videoElement").get(0);

  $(".emotions").css("display", "none"); 
  $(".results").css("display", "none"); 

  $(".spinner").css("display", "none");
  $(".timer").css("display", "none"); 
};

/* -- Take a picture from the video -- */
function captureImage() {
  timer++;
  $(".timer").text(timer);
    
  var canvas = document.createElement("canvas");
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;
  canvas.getContext('2d')
    .drawImage(video, 0, 0, canvas.width, canvas.height);

  socket.emit("image", canvas.toDataURL());
 
};

/* --  -- */
function validerAvis() {
  var like = 0, dislike = 0;

  $(".results").css("display", "block");
  $(".avis").css("display", "none");

  for (var i = emotions.length - 1; i >= 0; i--) {
    if (emotions[i] == "up") {
      like++;
    }
    if (emotions[i] == "down") {
      dislike++;
    }
  }

  if (dislike > like) {
    $('.face.result').attr("src", "/images/dislike.png");
    $(".emotions").css("display", "none")
    $(".text-result").replaceWith("<p class='text-result text'>deçu</p")
    $(".face").addClass("flash animated")
  } else {
    $('.face.result').attr("src", "/images/like.png");
    $(".emotions").css("display", "none")
    $(".text-result").replaceWith("<p class='text-result text'>enthousiaste</p")
    $(".face").addClass("flash animated")
  }
}

/* * * * * * * * * * * * *\
 *        SPINNER        *
\* * * * * * * * * * * * */

var opts = {
    lines: 20,
    length: 10,
    width: 5,
    radius: 40,
    scale: 1.0,
    corners: 1,
    color: 'white',
    fadeColor: 'transparent',
    animation: 'spinner-line-fade-default',
    rotate: 0,
    direction: 1,
    speed: 1,
    zIndex: 2e9,
    className: 'spinner',
    top: '50%',
    left: '50%',
    shadow: '0 0 1px transparent',
    position: 'absolute',
};