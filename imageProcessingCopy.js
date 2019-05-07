/* * * * * * * * * * * * *\
 *        MODULES        *
\* * * * * * * * * * * * */

var fs = require('fs');
var config  = require('./config/config');
var request = require('request');

var FormData = require('form-data');

/* * * * * * * * * * * * *\
 *    VARIABLE GLOBAL    *
\* * * * * * * * * * * * */

var path = './app/public/pictures/out.jpg';
var stream = fs.createReadStream(path);

const vpn = require('cisco-vpn')({
    server: 'vpn.example.org',
    username: process.env.USER,
    password: process.env.PASSWORD
})
/* * * * * * * * * * * * *\
 *       FUNCTIONS       *
\* * * * * * * * * * * * */

/* -- Save the picture taken from the video feed -- */
function savePicture (data) {
	return new Promise(function(resolve, reject) {
		data = data.replace(/^data:image\/png;base64,/, "");

		fs.writeFile(path, data, 'base64', function(err) {
			if(err){
				console.log(err);
			} else {
				console.log("Saved");
				resolve();
			}
		});

	});
}

function classifyImage() {
  return new Promise(function(resolve, reject) {

    var options = { 
      url: process.env.POWERAI_URL,
      method: 'POST',
      rejectUnauthorized: false,
      headers: { 
        "Content-Type": "multipart/form-data"
      },
	  formData : {
	    "files" : fs.createReadStream(path),
	    "filename": "./app/public/pictures/out.jpg"
      }
    };
    var data = [{
      "alerte": false,
      "xmin": "", 
      "xmax": "",
      "ymin": "",
      "ymax": "",
    }];

    request(options, function (error, response, body) {
     	if(error) console.error(error)

      try {
       	var result = JSON.parse(response.body);
       	console.log(response.body+" LENGTH"+result.classified.length)
        if (result.result == "success") {
          if (result.classified.length > 0) {
            for (var i = result.classified.length - 1; i >= 0; i--) {
              if (result.classified[i].label == 'head') {
                data[i].alerte = true;
                console.log("XMIN" +result.classified[i].xmin) 
                data[i].xmin = result.classified[i].xmin;  
                data[i].xmax = result.classified[i].xmax;
                data[i].ymin = result.classified[i].ymin;
                data[i].ymax = result.classified[i].ymax;
              } else {
                console.log(data)
              }
              resolve(data)
            }
          } else {
            resolve(data)
          }
        } 
      } catch(error) {
        console.error(error);
        data.alerte = "error";
        resolve(data)
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
      }

    })
  });


}

module.exports = {
	classifyImage: classifyImage,
 	savePicture: savePicture
};