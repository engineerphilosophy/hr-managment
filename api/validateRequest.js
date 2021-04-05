var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var superSecret = require('./secret').secret;
var validateUser = require('./auth').validateUser;
var multer = require('multer');
var api_roles = require('./required/api_roles');
var env = require('./env');
var connection = env.dbconnection;
const zipupload = require('./zipupload');

module.exports = function(req, res, next) {
  var token = req.headers.authorization;
  var process_type='';
  if(token==undefined){
    token = req.query.token;
    process_type=req.query.request_type; // when we download template then it is 'export'
  }
  var regex = new RegExp('\/superadmin\/uploadZipDocument');
  var url;
  if(req.method == "GET"){
    //for get request get url from req.params[0]
    url = req.params[0];
  }else{
    url = req.url;
  }
  //when file uploaded by admin to import users.
  if(regex.exec(url)){
    zipupload(req,res,function(error){
      if(error){
        console.log("error 0-0-0",error);
        if(error.code=='LIMIT_FILE_SIZE'){
          var message = "File size too large."
        }else{
          var message = "Wrong extension type. Allowed extension types are .xlsx and .xls."
        }
        var responsedata = {
          status:false,
          message:message,
          data: false,
          http_code:400
        }
        res.jsonp(responsedata);
      }else{
        var request_data = req.body;
        verify(token,req,url);
      }
    });
  }else{
    var request_data = req.body;
    verify(token,req,url);
  }

  function verify(token,request_data,url){
    if (token) {
      try {
        // verifies secret and checks exp
        jwt.verify(token, superSecret, function(err, decoded) {
          if (err) {
            console.log("error in token matching",err);
            res.status(401);
            return res.json({ status: 401, message: 'Failed to authenticate token.',data: false,http_code:400 });
          } else {
            if( decoded[0].username || decoded[0].email){
              req.body.userid = decoded[0].userid;
              req.body.user_type = decoded[0].user_type;
              // Authorize the user to see if s/he can access our resources
              validateUser( decoded[0],request_data,token,function(exists){
                if( exists == 1 ){
                  let urlArray = url.split('/');
                  let api = urlArray[urlArray.length-1];
                  if(api_roles[api]){
                    if(api_roles[api].indexOf(req.body.user_type)>=0){
                      next(); // To move to next middleware
                    }else if(process_type=='export'){
                      next(); // To move to next middleware
                    }else{
                      console.log("api -1= ",api);
                      res.status(401);
                      res.jsonp({
                        "status": 401,
                        "message": "Unauthenticated Access",
                        "http_code": 401,
                        "data": false
                      });
                      return;
                    }
                  }else if(process_type=='export'){
                    next(); // To move to next middleware
                  }else{
                    console.log("api -2= ",api);
                    res.status(401);
                    res.json({
                      "status": 401,
                      "message": "Invalid User"
                    });
                    return;
                  }
                }else{
                  console.log(" return 401  inner ")
                  // No user with this name exists, respond back with a 401
                  res.status(401);
                  res.json({
                    "status": 401,
                    "message": "Invalid User"
                  });
                  return;
                }
              });
            }else{
              // No user with this name exists, respond back with a 401
              res.status(401);
              res.json({
                "status": 401,
                "message": "Invalid User",
                data: false,
                http_code:401
              });
            }
          }
        });
      } catch (err) {
        res.status(500);
        res.json({
          "status": 500,
          "message": "Oops something went wrong",
          "error": err,
          data: false,
          http_code:500
        });

      }
    } else {
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid Token or Key",
        data: false,
        http_code:401
      });
    }
  }
};
