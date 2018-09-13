/* * * * * * * * * * * * *\
 *        MODULES        *
\* * * * * * * * * * * * */

var fs = require('fs');
var config  = require('./config/config');

var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var visualRecognition = new VisualRecognitionV3(config.visualRecognition);

/* * * * * * * * * * * * *\
 *    VARIABLE GLOBAL    *
\* * * * * * * * * * * * */

var path = './app/public/pictures/out.png';

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

/* -- Find out the class that Watson sees in the picture -- */
function classifyImage () {
	return new Promise(function(resolve, reject) {
		var params = {
		  images_file: fs.createReadStream(path),
		  classifier_ids: process.env.CLASSIFIER_ID,
		  threshold: 0.6
		};

		visualRecognition.classify(params, function(err, response) {
			if (err)
			    console.log(err);
			else {
				if (response.images[0].classifiers[0].classes[0]) {
					console.log("Emotions = " + response.images[0].classifiers[0].classes[0].class)
					resolve(response.images[0].classifiers[0].classes[0].class)
				} else {
					console.log("error")
					resolve()
				}
			}
		});
	});
}

module.exports = {
	classifyImage: classifyImage,
 	savePicture: savePicture
};