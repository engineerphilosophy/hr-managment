var env = require('./env');
var connection = env.dbconnection;
var CRUD = require('mysql-crud');
var superAdminCRUD = CRUD(connection,'superadmin');

function checkLoggedInUser(id,type,token,cb){
  let q = "select * from logged_in_users where userid = "+id+" and user_type = '"+type+"'"
  connection.query(q,function(error,result){
    if(error){
      console.log("error 0-0 auth",error);
      cb(error);
    }else{
      if(result.length){
        cb(null);
      }else{
        cb('error');
      }
    }
  })
}

var auth = {
  validateUser : function(user,req,token,callback){
    let body = req.body,query = req.query,url= req.url;
    if ( user == '' || user == null ) {
      var response = {
        "status": false,
        "message": "Invalid credentials"
      };
      callback(response);
    }else{
      checkLoggedInUser(user.userid, user.user_type, token,function(error){
        if(error){
          var response = {
            "status": false,
            "message": "Invalid credentials"
          };
          callback(response);
        }else{
          if(user.user_type == 'employee'){
            let query = "select * from employee where email = ?";
            connection.query(query,[user.email],function(error,result){
              if(error){
                var response = {
                  "status": false,
                  "message": "Invalid credentials"
                };
                callback(response);
              }else{
                callback(result.length);
              }
            });
          }else{
            //check superadmin
            superAdminCRUD.load({
              useremail : user.useremail,
            }, function(err, result){
              if(!err){
                callback(result.length);
              }else{
                var response = {
                  "status": false,
                  "message": "Invalid credentials"
                };
                callback(response);
              }
            });
          }
        }
      })
    }
  }
}
module.exports = auth;
