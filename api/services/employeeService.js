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
const superadminService = require('../services/superadminService');
const saltRounds = 10;
const employeeService = {
    //@Manglesh
    getEmployeeDetailsByEmail : function(email_address,select_password,callback){
      let password_string = select_password ? ",bcrypt_password " : "";
      let query1 = "SELECT `userid`, `name`, `mobile` "+password_string+", `email`, `salary`, `leave_credit`, `start_date`, `end_date`, `increament_date`, `document`, `modified_on`, `created_on` FROM `employee` WHERE email = ?";
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
      employeeService.getEmployeeDetailsByEmail(body.username,true,function(error,result_data){
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
                  userprofile[0].user_type = 'employee';
                  var token = common_functions.genToken(userprofile);
                  resdata.token = token;
                  resdata.record = userprofile;
                  callback(null,{status:true,message:"Employee logged-in successfully!!",data:resdata,http_code:200});
                  //insert into logged_in_user table
                  var query = "insert into logged_in_users (userid,user_type,email_address,token) values "
                  query += "(" + userprofile[0].userid + ",'employee','" + userprofile[0].email + "','" + token + "')";
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

    updatepassword : function(body,callback){
      body.select_password = true;
      superadminService.getEmployeeDetailsById(body,function(error,resposne){
        if(error){
          console.log("Error#0011 in 'employeeService.js'",error);
          callback(error,{status:false,message:"Error in saving data!!",data:[],http_code:400});
        }else{
          if(resposne.data && resposne.data.length > 0){
            let result = resposne.data;
            let bcrypt_password = result[0].bcrypt_password;
            if (bcrypt_password !== '') {
              bcrypt.compare(body.current, bcrypt_password, function (err, matched) {
                if (matched) {
                  bcrypt.hash(body.password, saltRounds, function (err, hash) {
                    let new_bcrypt_password = hash;
                    let updateQuery = "UPDATE `employee` SET `bcrypt_password`="+connection.escape(new_bcrypt_password)+" WHERE `userid`= "+body.id;
                    connection.query(updateQuery,function(error,result1){
                      if(error){
                        console.log("Error#0012 in 'employeeService.js'",error,updateQuery);
                        callback(error,{status:false,message:"Error in saving data!!",data:[],http_code:400});
                      }else{
                        callback(null,{status:true,message:"Password updated successfully!!",data:[],http_code:400});
                      }
                    });
                  });
                }else {
                  callback(null,{status:false,message:"Wrong current password!!",data:[],http_code:400});
                }
              });
            }else {
              callback(null,{status:false,message:"Wrong current password!!",data:[],http_code:400});
            }
          }else {
            callback(null,{status:false,message:"Employee not found!!",data:[],http_code:400});
          }
        }
      });
    },

    addUpdateDailyWorkData : function(body,callback){
      let date = body.date, userid = body.userid, work_data = body.workArray;
      let deleted_ids = body.deleted_ids;
      let row_ids = underscore.unique(underscore.pluck(work_data,'row_id'));
      let filteredIds = row_ids.filter(function(d){
        if(d){
          return d;
        }
      });
      // check and get existing data from employee_worksheet
      employeeService.getWorksheetDataByRowIds(filteredIds,userid,function(error,resposne){
        if(error){
          console.log("Error#004 in 'employeeService.js'",error);
          callback(error,{status:false,message:"#004:Error in saving data!!",data:false,http_code:400});
        }else {
          let existingIds = underscore.unique(underscore.pluck(resposne.data,'row_id'));
          async.eachOfSeries(work_data,function(row,index,cb){
            let insertQuery = "";
            let start_time = generateDateTime(date,row.start_time);
            let end_time = generateDateTime(date,row.end_time);
            date = generateDateTime(date);
            if(row.row_id){
              if(existingIds.indexOf(row.row_id) > -1){
                // remove those row ids which are already existings, then we will delete left ids from existingIds array
                existingIds.splice(existingIds.indexOf(row.row_id), 1);
              }
              if(deleted_ids.indexOf(row.row_id) > -1){
                // remove those row ids which are already existings, then we will delete left ids from existingIds array
                deleted_ids.splice(deleted_ids.indexOf(row.row_id), 1);
              }

              // row_id exist then update the row
              insertQuery = "UPDATE `employee_worksheet` SET `module`="+connection.escape(row.module)+",`description`="+connection.escape(row.description)+",`date`="+date+",`start_time`="+connection.escape(start_time)+",`end_time`="+connection.escape(end_time)+",`modified_on`= "+env.timestamp()+" WHERE row_id = "+row.row_id+" and userid = "+userid+" ";
            }else {
              // insert data for new row
              insertQuery = "INSERT INTO `employee_worksheet`(`userid`, `module`, `description`, `date`, `start_time`, `end_time`, `created_on`, `modified_on`) ";
              insertQuery += " VALUES ("+userid+","+connection.escape(row.module)+","+connection.escape(row.description)+","+date+","+connection.escape(start_time)+","+connection.escape(end_time)+","+env.timestamp()+","+env.timestamp()+")";
            }
            connection.query(insertQuery,function(error,result){
              if(error){
                console.log("Error#001 in 'employeeService.js'",error,insertQuery);
                return cb(error);
              }else{
                cb();
              }
            });
          },function(error){
            if(error){
              console.log("Error#001 in 'employeeService.js'",error);
              callback(error,{status:false,message:"#001:Error in saving data!!",data:false,http_code:400});
            }else{
              body.status = 1;
              employeeService.addUpdateEmployeeAttendence(body,function(error,response){
                if(error){
                  console.log("Error#005.1 in 'employeeService.js'",error,insertQuery);
                  callback(error,{status:false,message:"#005:Error in saving data!!",data:false,http_code:400});
                }else{
                  if(deleted_ids && deleted_ids.length > 0){
                    // delete row ids which are not existing any more
                    let deleteQuery = "DELETE FROM `employee_worksheet` WHERE `row_id` IN ("+deleted_ids+") AND `userid`="+userid;
                    connection.query(deleteQuery,function(error,result){
                      if(error){
                        console.log("Error#005 in 'employeeService.js'",error,deleteQuery);
                        callback(error,{status:false,message:"#005:Error in saving data!!",data:false,http_code:400});
                      }else{
                        callback(null,{status:true,message:"Work data saved successfully!!",data:{},http_code:200});
                      }
                    });
                  }else {
                    callback(null,{status:true,message:"Work data saved successfully!!",data:{},http_code:200});
                  }
                }
              });
            }
          });
        }
      });
    },

    addUpdateEmployeeAttendence : function(body,callback){
      let date = generateDateTime(body.date), userid = body.userid;
      let status = body.status ? 1 : 0;
      employeeService.getHolidayByGivenDate(date,function(error,response){
        if(error){
          console.log("Error#005.1 in 'employeeService.js'",error);
          callback(error,{status:false,message:"#005:Error in saving data!!",data:false,http_code:400});
        }else {
          let extra_day = response.data && response.data.length > 0 ? 1 : 0;
          let insertQuery = "INSERT INTO `employee_attendance`(`userid`, `date`, `status`, extra_day,`modified_on`, `created_on`) ";
          insertQuery += " VALUES ("+userid+","+date+","+status+","+extra_day+","+env.timestamp()+","+env.timestamp()+")";
          insertQuery += " ON DUPLICATE KEY UPDATE modified_on= VALUES(modified_on) ";
          connection.query(insertQuery,function(error,result){
            if(error){
              console.log("Error#005.1 in 'employeeService.js'",error,insertQuery);
              callback(error,{status:false,message:"#005:Error in saving data!!",data:false,http_code:400});
            }else{
              callback(null,{status:true,message:"Attendance added successfully!!",data:{},http_code:200});
            }
          });
        }
      });
    },

    deleteDailyWorkData : function(body,callback){
      if(body.row_ids && body.row_ids.length > 0){
        let query = "DELETE FROM `employee_worksheet` WHERE `row_id` IN ("+body.row_ids+") AND `userid`="+body.userid;
        connection.query(query, function (error, result) {
          if (error) {
            console.log("Error#009 in 'superadminService.js'", error, query);
            callback(error, {status: false, message: "Error in deleting data!!", data: {}, http_code: 400});
          } else {
            callback(null, {status: true,message: "Work data deleted successfully!!",data: {},http_code: 200});
          }
        });
      }else {
        callback(null, {status: false,message: "Holiday ids not found!!",data: {},http_code: 400});
      }
    },

    getWorksheetDataByRowIds : function(rowIds,userid,callback){
      if(rowIds && rowIds.length){
        let query = "select * from employee_worksheet where row_id IN ("+rowIds+") and userid = "+userid;
        connection.query(query,function(error,result){
          if(error){
            console.log("Error#003 in 'employeeService.js'",error,query);
            callback(error,{status:false,message:"Error in getting data!!",data:[],http_code:400});
          }else{
            callback(null,{status:true,message:"Work data fetched successfully!!",data:result,http_code:200});
          }
        });
      }else {
        callback(null,{status:true,message:"Work data fetched successfully!!",data:[],http_code:200});
      }
    },

    getEmployeesDailyWorkByDate : function(body,callback){
      let date = body.date;
      let start = new Date(+date);
      start.setHours(0,0,0,0);
      var sdate = +new Date(start);
      // end date
      let end = new Date(+date);
      end.setHours(23,59,59,999);
      var edate = +new Date(end);
      let query = "select * from employee_worksheet where `date` >= "+sdate+" AND `date` <= "+edate+" and userid = "+body.userid;
      connection.query(query,function(error,result){
        if(error){
          console.log("Error#003 in 'employeeService.js'",error,query);
          callback(error,{status:false,message:"Error in getting data!!",data:[],http_code:400});
        }else{
          callback(null,{status:true,message:"Work data fetched successfully!!",data:result,http_code:200});
        }
      });
    },

    addLeaveApplication : function(body,callback){
      let userid = body.userid;
      let date_from = body.date_from;
      let date_to = body.date_to;
      let start_date = new Date(date_from);
      let end_date = new Date(date_to);
      start_date = new Date(setDateStartAndEndTime(start_date,true));
      end_date = new Date(setDateStartAndEndTime(end_date,false));
      let datesArray = getDates(start_date, end_date);
      // if datesArray is empty then start date and end dates are same then push start date in array.
      if(datesArray.length==0){
        datesArray.push(start_date);
      }else {
        let last_date = datesArray[datesArray.length - 1];
        if(last_date.getDate() == last_date.getDate() && last_date.getMonth() == last_date.getMonth() && last_date.getFullYear() == last_date.getFullYear()){
          // nothing to do
        }else {
          // if last item of array is not same as end date then push end date
          datesArray.push(end_date);
        }
      }
      let inserted = false;
      async.eachOfSeries(datesArray,function(single_date,index,cb){
        employeeService.getHolidayByGivenDate(single_date,function(error,response){
          if(error){
            return cb(error);
          }else {
            let holiday = response.data && response.data.length > 0 ? true : false;
            if(holiday){
              // if holiday then do not add row
              cb();
            }else {
              let sdate = setDateStartAndEndTime(single_date,true);
              let edate = setDateStartAndEndTime(single_date,false);

              let insertQuery = "INSERT INTO `leave_application`(`userid`, `description`, `date_from`, `date_to`, `total_days`, `approve_status`, `created_on`, `modified_on`) ";
              insertQuery += " VALUES ("+userid+","+connection.escape(body.description)+","+sdate+","+edate+",1,0,"+env.timestamp()+","+env.timestamp()+")";
              connection.query(insertQuery,function(error,result){
                if(error){
                  console.log("Error#002 in 'employeeService.js'",error,insertQuery);
                  return cb(error);
                }else{
                  inserted = true;
                  cb();
                }
              });
            }
          }
        });
      },function(error){
        if(error){
          console.log("Error#0021 in 'employeeService.js'",error);
          callback(error,{status:false,message:"Error in saving data!!",data:false,http_code:400});
        }else{
          callback(null,{status:true,message:"Leave application saved successfully!!",data:{},http_code:200});
        }
      });
    },

    updateLeaveApplication : function(body,callback){
      let userid = body.userid;
      let row_id = body.row_id;
      let date_from = body.date_from;
      let date_to = body.date_to;
      let start_date = new Date(date_from);
      let end_date = new Date(date_from);
      start_date = +new Date(setDateStartAndEndTime(start_date,true));
      end_date = +new Date(setDateStartAndEndTime(end_date,false));
      let updateQuery = "UPDATE `leave_application` SET `description`="+connection.escape(body.description)+",`date_from`="+start_date+",`date_to`="+end_date+",`total_days`=1,`modified_on`="+start_date+" WHERE `row_id` = "+row_id+" AND `userid` = "+userid;
      connection.query(updateQuery, function (error, result) {
        if (error) {
          console.log("Error#0064 in 'employeeService.js'", error, updateQuery);
          callback(error, {status: false, message: "Error in saving data!!", data: [], http_code: 400});
        } else {
          callback(null, {status: true,message: "Leave application updated successfully!!",data: [],http_code: 200});
        }
      });
    },

    getHolidayByGivenDate : function(date,callback){
      let start = new Date(date);
      start.setHours(0,0,0,0);
      var sdate = +new Date(start);
      // end date
      let end = new Date(date);
      end.setHours(23,59,59,999);
      var edate = +new Date(end);

      let query = "SELECT * FROM `holidays` WHERE `date` >= "+sdate+" AND `date` <= "+edate;
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#0061 in 'employeeService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          callback(null, {status: true,message: "Holiday found successfully!!",data: result,http_code: 200});
        }
      });
    },

    getLeaveApplicationById : function(body,callback){
      let query = "SELECT * FROM `leave_application` WHERE `row_id`="+body.row_id+" AND `userid` = "+body.userid;
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#006 in 'employeeService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          callback(null, {status: true,message: "Leave application found successfully!!",data: result,http_code: 200});
        }
      });
    },

    deleteLeaveApplication : function(body,callback){
      let userid = body.userid, row_id = body.row_id;
      employeeService.getLeaveApplicationById(body,function(error,response){
        if(error){
          callback(error, {status: false, message: "Error in deleting data!!", data: {}, http_code: 400});
        }else {
          let leaveData = response.data;
          let date_from = leaveData && leaveData.length > 0 ? leaveData[0].date_from : 0;
          let today_date = +new Date();
          if(date_from <= today_date){
            callback(error, {status: false, message: "Leave date is expired!!", data: {}, http_code: 400});
          }else {
            let deleteQuery = "DELETE FROM `leave_application` WHERE `row_id`="+body.row_id+" AND `userid` = "+body.userid;
            connection.query(deleteQuery, function (error, result) {
              if (error) {
                console.log("Error#006 in 'employeeService.js'", error, deleteQuery);
                callback(error, {status: false, message: "Error in deleting data!!", data: [], http_code: 400});
              } else {
                callback(null, {status: true,message: "Leave application deleted successfully!!",data: [],http_code: 200});
              }
            });
          }
        }
      });
    },

    getEmployeeReportCard : function(body,callback){
      let userid = body.userid;
      let todaydate = new Date();
      var firstDay = +new Date(todaydate.getFullYear(), todaydate.getMonth(), 1);
      var lastDay = +new Date(todaydate.getFullYear(), todaydate.getMonth() + 1, 0);
      let leaveQuery = "SELECT em.*,a.total_leave,a.approved,a.rejected,a.pending FROM employee as em ";
      leaveQuery += " LEFT JOIN (SELECT userid,COUNT(*) as total_leave,SUM(if(approve_status = 1, 1, 0)) as approved,SUM(if(approve_status = 2, 1, 0)) as rejected,SUM(if(approve_status = 0, 1, 0)) as pending FROM `leave_application` WHERE userid = "+userid+" AND `date_from` >= "+firstDay+" AND `date_from` <= "+lastDay+") ";
      leaveQuery += " as a ON em.userid = a.userid ";
      leaveQuery += " WHERE em.userid = "+userid+" ";
      connection.query(leaveQuery, function (error, result) {
        if (error) {
          console.log("Error#0066 in 'employeeService.js'", error, leaveQuery);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          callback(null, {status: true,message: "employee report found successfully!!",data: result,http_code: 200});
        }
      });
    },

    getEmployeeWorkingDayDetails : function(body,callback){
      let from_date = body.from_date ? new Date(+body.from_date) : new Date();
      let to_date = body.to_date ? new Date(+body.to_date) : new Date();
      var start_date = setDateStartAndEndTime(+from_date,true);
      var end_date = setDateStartAndEndTime(+to_date,false);

      let total_days = employeeService.getDaysBetween2Dates(start_date,end_date);

      let query = "SELECT em.userid,em.name,em.mobile,em.email,SUM(IF(ea.status = 0,1,0)) as absent, SUM(IF(ea.status = 1,1,0)) as present,";
      query += " ("+total_days+" - h.total_holidays) as total_working_days,h.total_holidays,la.total_leaves, ";
      query += " b.total_days ";
      query += " FROM `employee_attendance` as ea ";
      query += " LEFT JOIN employee as em ON ea.userid = em.userid ";
      // query += " LEFT JOIN employee_worksheet as a ON ea.userid = a.userid and ea.date = a.date ";
      query += " LEFT JOIN (SELECT COUNT(t.row_id) as total_days,t.userid FROM (SELECT * FROM `employee_worksheet` WHERE userid = "+body.id+" and date >= "+start_date+" and date <= "+end_date+"  GROUP BY userid,date) as t GROUP BY t.userid) as b ON b.userid = ea.userid ";
      query += " LEFT JOIN (SELECT COUNT(*) as total_holidays,"+body.id+" as userid FROM `holidays` WHERE `date`>= "+start_date+" AND `date`<= "+end_date+") as h ON h.userid = ea.userid ";
      query += " LEFT JOIN (SELECT COUNT(*) as total_leaves,userid FROM `leave_application` WHERE `date_from`>= "+start_date+" AND `date_from`<= "+end_date+") as la ON la.userid = ea.userid ";
      // query += " LEFT JOIN (SELECT userid,SUM(IF(status = 0,1,0)) as absent, SUM(status) as present FROM `employee_attendance` WHERE userid = "+body.id+" and date >= "+start_date+" and date <= "+end_date+" GROUP BY userid) as ab on ab.userid = ea.userid ";
      query += " WHERE ea.userid = "+body.id+" and ea.date >= "+start_date+" and ea.date <= "+end_date+" GROUP BY ea.userid ";
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#0068 in 'employeeService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          callback(null, {status: true,message: "employee report found successfully!!",data: result,http_code: 200});
        }
      });
    },

    getDaysBetween2Dates(first_date,second_date){
      let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      let firstDate = new Date(first_date);
      let secondDate = new Date(second_date);

      let diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
      return diffDays;
    }
};
module.exports = employeeService;

function getDates(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate < stopDate) {
    dateArray.push(new Date (currentDate));
    currentDate = addDays(currentDate,1);
  }
  return dateArray;
}

function addDays(date,days) {
  date.setDate(date.getDate() + days);
  return date;
}

function generateDateTime(date,time,end){
  let newDate = new Date(date);
  if(end){
    newDate.setHours(23,59,59,999);
  }else {
    newDate.setHours(0,0,0,0);
  }
  let start_date = +new Date(newDate);
  if(time){
    let timeArray = time ? time.split(':') : [];
    let hour = 60*60*1000*(parseInt(timeArray[0]));
    let minute = 60*1000*(parseInt(timeArray[1]));
    return (start_date + hour + minute);
  }else {
    return start_date;
  }
}

function setDateStartAndEndTime(date,start_time){
  var start = date ? new Date(date) : new Date();
  if(start_time){
    start.setHours(0,0,0,0);
  }else {
    start.setHours(23,59,59,999);
  }
  return +new Date(start);
}
