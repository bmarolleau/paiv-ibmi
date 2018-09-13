var util = require('util');

exports.imageForm = function(req, res) {
    res.render('upload', {
        title: 'Upload Images'
    });
};

exports.uploadImage = function(req, res, next){
        console.log('file info: ',req.files.image);

        //split the url into an array and then get the last chunk and render it out in the send req.
        var pathArray = req.files.image.path.split( '/' );

        res.send(util.format(' Task Complete \n uploaded %s (%d Kb) to %s as %s'
            , req.files.image.name
            , req.files.image.size / 1024 | 0
            , req.files.image.path
            , req.body.title
            , req.files.image
            , '<img src="uploads/' + pathArray[(pathArray.length - 1)] + '">'
        ));


};