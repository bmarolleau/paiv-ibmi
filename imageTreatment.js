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
				// console.log("Saved");
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
    var data = {
      "alerte": false,
      "xmin": "", 
      "xmax": "",
      "ymin": "",
      "ymax": "",
    };

    request(options, function (error, response, body) {
     	if(error) console.error(error)

      try {
       	var result = JSON.parse(response.body);
       	console.log(response.body)
        if (result.result == "success") {
          if (result.classified.length > 0) {
        		if (result.classified[0].label == 'vide') {
              data.alerte = true;
              data.xmin = result.classified[0].xmin;
              data.xmax = result.classified[0].xmax;
              data.ymin = result.classified[0].ymin;
              data.ymax = result.classified[0].ymax;
        			resolve(data)
            } else {
              console.log(data)
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