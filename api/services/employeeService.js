//Created By:- EP-Manglesh
//Description:- Employee login and all other stuffs related to employee
//Created Date:- 01/04/2021
const async = require('async');
const env = require('../env');
const connection = env.dbconnection;
const transporter = env.transporter;
const mkdirp = require('mkdirp');
const CRUD = require('mysql-crud');
const underscore = require('underscore');
const extend = require('xtend');
const bcrypt = require('bcrypt');
const common_functions = require('../functions');
const saltRounds = 10;
const employeeService = {
    //@Manglesh
    getEmployeeDetailsByEmail : function(email_address,callback){
      let query1 = "SELECT `userid`, `name`, `mobile`, `email`, `salary`, `leave_credit`, `start_date`, `end_date`, `increament_date`, `document`, `modified_on`, `created_on` FROM `employee` WHERE email = ?";
      connection.query(query1,[email_address],function(error,result){
        if(error){
          console.log("Error#001 in 'employeeService.js'",error,query1);
          callback(error,{status:false,message:"Error in getting data!!",data:[],http_code:400});
        }else{
          if(result && result.length>0){
            callback(null,{status:true,message:"Employee found successfully!!",data:result,http_code:200});
          }else {
            callback(null,{status:false,message:"Employee does not exist in system!!",data:[],http_code:400});
          }
        }
      });
    },
    //@Manglesh
    loginEmployee : function(body,callback){
      employeeService.getEmployeeDetailsByEmail(body.username,function(error,result_data){
        if(error){
          console.log("Error#001 in 'employeeService.js'",error);
          callback(error,{status:false,message:"Error in getting data!!",data:false,http_code:400});
        }else{
          var result=result_data.data;
          if(result.length > 0){
            // check if employee session is end
            if(result[0].end_date && result[0].end_date <= (+new Date())){
              callback(null,{status:false,message:"Employee session is ended!!",data:false,http_code:400});
            }else {
              let profile = result[0];
              let bcrypt_password = profile.bcrypt_password;
              delete profile.bcrypt_password; // removing bcrypt_password from profile to prevent from sending to client;
              bcrypt.compare(body.password, bcrypt_password,function(err,matched) {
                if(matched){
                  //password matched let the user access system.
                  var resdata = {};
                  var userprofile = [profile];
                  var token = common_functions.genToken(userprofile);
                  resdata.token = token;
                  resdata.record = userprofile;
                  userprofile[0].user_type = 'employee';
                  callback(null,{status:true,message:"Employee logged-in successfully!!",data:resdata,http_code:200});
                  //insert into logged_in_user table
                  var query = "insert into logged_in_users (userid,user_type,email_address,token) values "
                  query += "(" + userprofile[0].userid + ",'employee','" + val[0].email + "','" + token + "')";
                  connection.query(query, function(error, result) {
                    if (error) {
                      console.log("Error:#S002 in 'employeeService.js'",error,query);
                    }
                  });
                }else{
                  callback(null,{status:false,message:"Password does not match!!",data:false,http_code:400});
                }
              });
            }
          }else{
            callback(null,{status:false,message:"Username does not exists!!",data:false,http_code:400});
          }
        }
      });
    },

    addUpdateDailyWorkData : function(body,callback){

    },

    applyLeaveApplication : function(body,callback){
      
    }
};
module.exports = employeeService;
