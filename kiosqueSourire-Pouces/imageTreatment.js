var fs = require('fs');
var config  = require('./config/config');

var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var visualRecognition = watson.conversation(config.visualRecognition);

function classifyImage (imgFile) {
	return new Promise(function(resolve, reject) {
		var params = {
		  images_file: fs.createReadStream('./app/public/pictures/out.png'),
		  classifier_ids: process.env.CLASSIFIER_ID,
		  threshold: 0.6
		};

		visualRecognition.classify(params, function(err, response) {
			if (err)
			    console.log(err);
			else {
			    console.log("e");
				resolve(response.images[0].classifiers[0].classes[0].class)
			}
		});
	});
}

function savePicture (data) {
	return new Promise(function(resolve, reject) {
		
		data = data.replace(/^data:image\/png;base64,/, "");

		fs.writeFile("./app/public/pictures/out.png", data, 'base64', function(err) {
			if(err){
				console.log(err);
			} else {
				resolve();
				// console.log(JSON.stringify({'status': 1, 'msg': 'Image Uploaded'}));
			}
		});

	});
}

module.exports = {
	classifyImage: classifyImage,
 	savePicture: savePicture
};