
var express = require('express');
var multer = require('multer');
var env = require('./env');
var mkdirp = require('mkdirp');
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
      mkdirp(env.uploadPath+'documents', function(err) {
        if(err){
          console.log("Error#007 in 'zipupload.js'",err);
          cb(err, env.uploadPath+"documents/")
        }else {
          cb(null, env.uploadPath+"documents/")
        }
      });
    },
    filename: function (req, file, cb) {
      console.log("documents--",file);
      var servFileName = Date.now()+'_'+file.originalname;//Work same as +new Date();
      cb(null, servFileName)
    }
});

var zipupload = multer({ //multer settings
                    storage: storage,
                }).single('file');
module.exports = zipupload;
