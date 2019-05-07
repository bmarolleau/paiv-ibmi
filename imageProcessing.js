/* * * * * * * * * * * * *\
 *        MODULES        *
\* * * * * * * * * * * * */

var fs = require('fs');
var config  = require('./config/config');
var request = require('request');

var FormData = require('form-data');

/************************\
 *	IBM i Db2 for i *
\************************/ 
const {dbconn, dbstmt} = require('idb-connector');
var latestInsert=0;
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
				console.log("New Image received : saved in the IFS");
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
    var data = [];
    request(options, function (error, response, body) {
     	if(error) console.error(error)

      try {
       	var result = JSON.parse(response.body);
       	//console.log(response.body+" LENGTH"+result.classified.length)
        if (result.result == "success") {
          if (result.classified.length > 0) {
            for (var i = result.classified.length - 1; i >= 0; i--) {

              tempData={
                "alerte": false,
                "xmin": "", 
                "xmax": "",
                "ymin": "",
                "ymax": "",
              }
              if (result.classified[i].label == 'head') {
                
                tempData.alerte = true;
                //console.log("XMIN" +result.classified[i].xmin) 
                tempData.xmin = result.classified[i].xmin;  
                tempData.xmax = result.classified[i].xmax;
                tempData.ymin = result.classified[i].ymin;
                tempData.ymax = result.classified[i].ymax;
                data.push(tempData);
                
                //sSql = 'INSERT INTO AIVISION.DETECTIONS';
                sqlInsert="INSERT INTO AIVISION.DETECTIONS(detectedLabel, confidence,ymax,xmax, xmin,ymin, attr,webAPI,imageUrl) VALUES ('"+result.classified[i].label+"',"+result.classified[i].confidence+","+tempData.ymax+","+tempData.xmax+","+tempData.xmin+","+tempData.ymin+",'empty','"+result.webAPIId+"','"+ result.imageUrl+"')";
                
                detectionTS= new Date().getTime();
                //console.log(detectionTS, latestInsert);
                if (detectionTS - latestInsert > 10000) {
                console.log("Object Detected!!( 10 second sampling) : Insert in Db2 for i AIVISION Database "+sqlInsert );
                connection = new dbconn();
                connection.conn('*LOCAL');
                //#statement = new dbstmt(connection);
                //#res1=statement.execSync('select count(*) from aivision.detections');
                //#console.log(`Result Set: ${JSON.stringify(res1)}`);
                //#statement.close();
                statement = new dbstmt(connection);
                res2=statement.execSync(sqlInsert);
                statement.close();
                delete statement;
                connection.disconn();
                connection.close();
                latestInsert=detectionTS;
		}
                
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
