// Connexion à socket.io
var socket = io();
var Debut;
var Fin;

window.addEventListener("load", function() {
console.log("h")
  var video, $output;
  var scale = 0.25;
  var timer = 3;
  var emotions = [];

  var spinner = new Spinner(opts).spin();
  $(".loading").append(spinner.el);

  var initialize = function() {
    video = $(".videoElement").get(0);
    $(".capture").click(captureImage);

    $(".emotions").css("display", "none"); 
    $(".results").css("display", "none"); 

    $(".spinner").css("display", "none");
    $(".timer").css("display", "none");
  };
 
  var captureImage = function() {
    if (timer < 3) { 
    // if (emotions.length < 3) { 

      timer++;
      $(".timer").text(timer);
    
      var canvas = document.createElement("canvas");
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      canvas.getContext('2d')
        .drawImage(video, 0, 0, canvas.width, canvas.height);

      socket.emit("image", canvas.toDataURL());
    }
    else if (timer == 3) {
      if(emotions.length < 3) {

      } else {
        timer++;
      validerAvis();
      }
    }
    else {
      $(".spinner").css("display", "none");
      $(".timer").css("display", "none");
      $(".face").removeClass("flash animated")
      $(".like").addClass("select").removeClass("unselect");
      $(".dislike").addClass("select").removeClass("unselect");
    }
  };
 
  $(initialize);   

  if (navigator.mediaDevices.getUserMedia) {       
      navigator.mediaDevices.getUserMedia({video: true})
    .then(function(stream) {
      video.srcObject = stream;
    })
    .catch(function(err0r) {
      console.log("Something went wrong!");
    });
}

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

  var clickC = function() {
    $(".capture").click();
  }

  $(".button-start").click(function() { 
    console.log("o")
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

  var validerAvis = function() {
    // var h=0, n=0, a=0;
    var l=0, d=0;
    console.log("-- VALIDATION --")
    console.log(emotions)
    $(".results").css("display", "block");
    $(".avis").css("display", "none");
      console.log("results = " + new Date())
    
    for (var i = emotions.length - 1; i >= 0; i--) {
      if (emotions[i] == "up") {
        l++;
      }
      if (emotions[i] == "down") {
        d++;
      }
    }

    if (d > l) {
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

  $(".validate").click(function (){
    $(".results").css("display", "none");
    $(".avis").css("display", "flex");
  })



window.setInterval(clickC, 1000);
});

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