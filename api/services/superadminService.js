//Created By:- EP-Manglesh
//Description:- Service to perform mysql queries related to superadmin
//Created Date:- 03-04-2021
const async = require('async');
const env = require('../env');
const connection = env.dbconnection;
const transporter = env.transporter;
const underscore = require('underscore');
const bcrypt = require('bcrypt');
const mkdirp = require('mkdirp');
const XlsxPopulate = require('xlsx-populate');
const common_functions = require('../functions');
const saltRounds = 10;
const monthnamelist = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const superadminService = {

    superAdminLogin: function (body, callback) {
      var username = connection.escape(body.username);
      var password = body.password;
      //first checking whether username exists
      var query = "select userid,bcrypt_password,username,useremail from superadmin where username = " + username;
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#001 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in login super admin!!", data: {}, http_code: 400});
        } else {
          //user name exits
          //get bcrypt_password and match with password
          if (result.length > 0) {
            body.userid = result[0].userid;
            var bcrypt_password = result[0].bcrypt_password;
            bcrypt.compare(body.password, bcrypt_password, function (err, matched) {
              if (matched) {
                var resdata = {};
                delete result[0].bcrypt_password;
                var userprofile = [result[0]];
                userprofile[0].user_type = 'superadmin';
                var token = common_functions.genToken(userprofile);
                resdata.token = token;
                resdata.record = userprofile;
                callback(null, {status: true,message: "User logged in successfully!!",data: resdata,http_code: 200});
                //insert into logged_in_user table
                var query = "insert into logged_in_users (userid,user_type,email_address,token) values "
                query += "(" + userprofile[0].userid + ",'superadmin','" + userprofile[0].useremail + "','" + token + "')";
                connection.query(query, function(error, result) {
                  if (error) {
                    console.log("Error:#S002 in 'superadminService.js'",error,query);
                  }
                });
              } else {
                callback(error, {status: false,message: "User and password does not match!!",data: {},http_code: 400});
              }
            });
          } else {
            //user not found
            callback(null, {status: false, message: "User not found!!", data: {}, http_code: 400});
          }
        }
      });
    },

    updatepassword : function(body,callback){
      var query = "select userid,bcrypt_password,username,useremail from superadmin where userid = " + body.userid;
      connection.query(query, function (error, result) {
        if(error){
          console.log("Error#0011 in 'superadminService.js'",error,query);
          callback(error,{status:false,message:"Error in saving data!!",data:[],http_code:400});
        }else{
          if(result && result.length > 0){
            let bcrypt_password = result[0].bcrypt_password;
            if (bcrypt_password !== '') {
              bcrypt.compare(body.current, bcrypt_password, function (err, matched) {
                if (matched) {
                  bcrypt.hash(body.password, saltRounds, function (err, hash) {
                    let new_bcrypt_password = hash;
                    let updateQuery = "UPDATE `superadmin` SET `bcrypt_password`="+connection.escape(new_bcrypt_password)+" WHERE `userid`= "+body.id;
                    connection.query(updateQuery,function(error,result1){
                      if(error){
                        console.log("Error#0012 in 'superadminService.js'",error,updateQuery);
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
            callback(null,{status:false,message:"Superadmin not found!!",data:[],http_code:400});
          }
        }
      });
    },

    getEmployeeList : function(body,callback){
      let dates_string = superadminService.convertDateAccordingToOffset(['start_date','end_date','increament_date'],body.offset,'');
      let query = "SELECT `userid`, `name`, `mobile`, `email`, `salary`, `leave_credit`, "+dates_string+", `document`, `modified_on`, `created_on` FROM `employee` ORDER BY userid DESC";
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#002 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: {}, http_code: 400});
        } else {
          callback(null, {status: true,message: "Employee list found successfully!!",data: result,http_code: 200});
        }
      });
    },

    getEmployeeDetailsById : function(body,callback){
      let userid = body.user_type == 'superadmin' ? body.id : body.userid;
      let password_string = body.select_password ? ",bcrypt_password " : "";
      let dates_string = superadminService.convertDateAccordingToOffset(['start_date','end_date','increament_date'],body.offset,'');
      let query = "SELECT `userid`,`userid` as id, `name`, `mobile`, `email`, `salary`, `leave_credit`, "+dates_string+", `document`, `modified_on`, `created_on` "+password_string+" FROM `employee` WHERE userid = "+userid+" ";
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#002 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: {}, http_code: 400});
        } else {
          callback(null, {status: true,message: "Employee list found successfully!!",data: result,http_code: 200});
        }
      });
    },

    addUpdateEmployeeDetails : function(body,callback){
      body.leave_credit = body.leave_credit ? body.leave_credit : 0;
      body.salary = body.salary ? body.salary : 0;
      let password = body.password ? body.password : "123";
      let mailvalid = ValidateEmail(body.email);
      var start_date = setDateStartAndEndTime(body.start_date,true);
      var increament_date = setDateStartAndEndTime(body.increament_date,true);
      if(mailvalid){
        const employeeService = require('../services/employeeService');
        employeeService.getEmployeeDetailsByEmail(body.email,false,function(error,response){
          if (error) {
            console.log("Error#0014 in 'superadminService.js'", error);
            callback(error, {status: false, message: "Error in saving data!!", data: {}, http_code: 400});
          } else {
            let user = response.data;
            bcrypt.hash(password, saltRounds, function (err, hash) {
              body.bcrypt_password = hash;
              if(body.id){
                let id = user && user.length > 0 ? user[0].userid : body.id;
                if(id == body.id){
                  let query = "UPDATE `employee` SET `name`= "+connection.escape(body.name)+",`mobile`= "+connection.escape(body.mobile)+",`email`= "+connection.escape(body.email)+",`salary`= "+body.salary+",`leave_credit`= "+body.leave_credit+",";
                  if(body.password){
                    query += " bcrypt_password = "+connection.escape(hash)+", ";
                  }
                  query += " `start_date`= "+start_date+",`increament_date`= "+increament_date+",`document`="+connection.escape(body.document)+",`modified_on`= "+env.timestamp()+" ";
                  query += " WHERE `userid` = "+body.id;
                  connection.query(query, function (error, result) {
                    if (error) {
                      console.log("Error#004 in 'superadminService.js'", error, query);
                      callback(error, {status: false, message: "Error in saving data!!", data: {}, http_code: 400});
                    } else {
                      callback(null, {status: true,message: "Employee details updated successfully!!",data: body.id,http_code: 200});
                    }
                  });
                }else {
                  callback(null, {status: false, message: "Email already exists!!", data: {}, http_code: 400});
                }
              }else {
                if(user && user.length > 0){
                  callback(null, {status: false, message: "Email already exists!!", data: {}, http_code: 400});
                }else {
                  let query = "INSERT INTO `employee` (`name`, `mobile`, `email`,bcrypt_password, `salary`, `leave_credit`, `start_date`, `increament_date`, `document`, `modified_on`, `created_on`) ";
                  query += " VALUES ("+connection.escape(body.name)+","+connection.escape(body.mobile)+","+connection.escape(body.email)+",";
                  query += " "+connection.escape(hash)+", ";
                  query += " "+body.salary+","+body.leave_credit+","+start_date+","+increament_date+","+connection.escape(body.document)+","+env.timestamp()+","+env.timestamp()+")";
                  connection.query(query, function (error, result) {
                    if (error) {
                      console.log("Error#003 in 'superadminService.js'", error, query);
                      callback(error, {status: false, message: "Error in saving data!!", data: {}, http_code: 400});
                    } else {
                      var employee_id=result.insertId;
                      callback(null, {status: true,message: "Employee details saved successfully!!",data: employee_id,http_code: 200});
                    }
                  });
                }
              }
            });
          }
        });
      }else {
        callback(null, {status: false, message: "Invalid email address!!", data: {}, http_code: 400});
      }
    },

    endEmployeeSession : function(body,callback){
      var end_date = setDateStartAndEndTime(body.end_date,true);
      let query = "UPDATE `employee` SET `end_date`= "+end_date+",`modified_on`= "+env.timestamp()+" WHERE `userid`= "+body.id;
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#005 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in saving data!!", data: {}, http_code: 400});
        } else {
          callback(null, {status: true,message: "Employee session updated successfully!!",data: body.id,http_code: 200});
        }
      });
    },

    approveLeaveApplication : function(body,callback){
      if(body.row_ids && body.row_ids.length > 0){
        body.status = body.status ? body.status : 0;
        let query = "UPDATE `leave_application` SET `approve_status`= "+body.status+",`modified_on`= "+env.timestamp()+" WHERE row_id IN ("+body.row_ids+")";
        connection.query(query, function (error, result) {
          if (error) {
            console.log("Error#006 in 'superadminService.js'", error, query);
            callback(error, {status: false, message: "Error in saving data!!", data: {}, http_code: 400});
          } else {
            callback(null, {status: true,message: "Employee leave applications approved successfully!!",data: {},http_code: 200});
          }
        });
      }else {
        callback(null, {status: false, message: "No data found!!", data: {}, http_code: 400});
      }
    },

    getEmployeesDailyWorksheetData : function(body,callback){
      // default - get all users today date worksheet
      // if month selected then get monthly all users worksheet
      // if month and user is selected then get a user monthly report
      // if only user is selected then get a user today worksheet
      let monthly = body.monthly, daily = body.daily, date = body.date, userid = body.id;
      let offset = body.offset;
      // today start date
      date = date ? new Date(+date) : new Date();
      var start_date = setDateStartAndEndTime(false,true);
      var end_date = setDateStartAndEndTime(false,false);
      let whereCondition = " a.date >= "+start_date+" AND a.date <= "+end_date+" ";
      // check and create monthly where condition
      if(monthly == true || monthly == "true"){
        var firstDay = +new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = +new Date(date.getFullYear(), date.getMonth() + 1, 0);
        whereCondition = " a.date >= "+firstDay+" AND a.date <= "+lastDay+" ";
      }else if (daily == true || daily == "true") {
        date = body.date ? new Date(body.date) : new Date();
        // check and create daily where condition
        start_date = setDateStartAndEndTime(date,true);
        // today end date
        end_date = setDateStartAndEndTime(date,false);
        whereCondition = " a.date >= "+start_date+" AND a.date <= "+end_date+" ";
      }
      // check if user is selected then add where condition for a user
      if(userid){
        whereCondition += " and a.userid = "+userid+" ";
      }
      let dates_string = superadminService.convertDateAccordingToOffset(['date','start_time','end_time'],offset,'a');
      let query = "SELECT t.*, TIME_FORMAT(from_unixtime((t.start_time - "+offset+")/1000),'%r') as formatted_start_time,TIME_FORMAT(from_unixtime((t.end_time - "+offset+")/1000),'%r') as formatted_end_time ";
      query += ",DATE_FORMAT(from_unixtime((t.date - "+offset+")/1000),'%d/%m/%Y') as formatted_date,DATE_FORMAT(from_unixtime((t.date - "+offset+")/1000),'%d %M') as date_month FROM ";
      query += "(SELECT a.`row_id`, a.`userid`, a.`module`, a.`description`, a.`created_on`, a.`modified_on`,b.name, b.email,b.mobile, "+dates_string+" ";
      query += " FROM `employee_worksheet` as a ";
      query += " LEFT JOIN employee as b ON a.userid = b.userid ";
      query += " WHERE "+whereCondition+" order by a.`date`,a.userid DESC) as t order by t.`date` DESC";
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#007 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          callback(null, {status: true,message: "Employee worksheet data found successfully!!",data: result,http_code: 200});
        }
      });
    },

    getEmployeesDailyWorksheetDataByDates : function(body,callback){
      // default - get all users today date worksheet
      // if month selected then get monthly all users worksheet
      // if month and user is selected then get a user monthly report
      // if only user is selected then get a user today worksheet
      let from_date = body.from_date,to_date = body.to_date, userid = body.id;
      let offset = body.offset;
      // today start date
      if(!from_date){
        if(userid){
          let date = new Date();
          from_date = new Date(date.getFullYear(), date.getMonth(), 1); // get current month first date
        }else {
          from_date = new Date(+new Date() - (5*24*60*60*1000)); // 5 day before date
        }
      }
      // to_date = to_date ? new Date(to_date) : new Date();
      var start_date = setDateStartAndEndTime(+from_date,true);
      var end_date = setDateStartAndEndTime(+to_date,false);
      let whereCondition = " ea.date >= "+start_date+" AND ea.date <= "+end_date+" ";
      // check if user is selected then add where condition for a user
      let order_by ="order by ea.`date`,ea.userid DESC";
      if(userid){
        order_by =" order by ea.`date` DESC";
        whereCondition += " and ea.userid = "+userid+" ";
      }
      let dates_string = superadminService.convertDateAccordingToOffset(['date','start_time','end_time'],offset,'a');
      offset = offset ? offset : 0;
      var offset_string = offset;
      if(offset>=0){
        offset_string = " + "+offset;
      }
      let query = "SELECT t.*,TIME_FORMAT(from_unixtime((t.start_time - "+offset+")/1000),'%r') as formatted_start_time,TIME_FORMAT(from_unixtime((t.end_time - "+offset+")/1000),'%r') as formatted_end_time ";
      query += ",DATE_FORMAT(from_unixtime((IF(date,date,ea_date) - "+offset+")/1000),'%d-%m-%Y') as formatted_date,DATE_FORMAT(from_unixtime((IF(date,date,ea_date) - "+offset+")/1000),'%d %M') as date_month ";
      query += " FROM (SELECT ea.row_id as ea_id,(ea.date "+offset_string+") as ea_date,a.`row_id`, ea.`userid`, a.`module`, a.`description`,a.`created_on`, a.`modified_on`,b.name, b.email,b.mobile,ea.status,"+dates_string+" ";
      query += " FROM `employee_attendance` as ea ";
      query += " LEFT JOIN employee_worksheet as a ON a.userid = ea.userid AND a.date = ea.date ";
      query += " LEFT JOIN employee as b ON b.userid = ea.userid ";
      query += " WHERE "+whereCondition+" "+order_by+") as t ORDER BY t.ea_date DESC";
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#007 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          let grouped_data = {};
          if(userid){
            grouped_data = underscore.groupBy(result,'ea_date');
            const employeeService = require('../services/employeeService');
            employeeService.getEmployeeWorkingDayDetails(body,function(error,response){
              if (error) {
                console.log("Error#0071 in 'superadminService.js'", error);
                callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
              } else {
                let user_info = (response.data && response.data.length > 0) ? response.data[0] : {};
                callback(null, {status: true,message: "Employee worksheet data found successfully!!",data: {result:result,grouped_data:grouped_data,working_details:user_info},http_code: 200});
              }
            });
          }else {
            let data = underscore.groupBy(result,'ea_date');
            Object.keys(data).map(function(d){
              if(data[d] && data[d].length > 0){
                grouped_data[d] = underscore.groupBy(data[d],'userid');
              }
            });
            callback(null, {status: true,message: "Employee worksheet data found successfully!!",data: {result:result,grouped_data:grouped_data},http_code: 200});
          }
        }
      });
    },

    convertDateAccordingToOffset : function(columns,offset,alias){
      var string = [];
      offset = offset ? offset : 0;
      var offset_string = offset;
      if(offset>=0){
        offset_string = " + "+offset;
      }
      for(var i=0; i< columns.length; i++){
        let column =  columns[i];
        if(alias){
          column = alias+"."+columns[i];
        }
        string.push("("+column+" "+offset_string+") as "+columns[i]+" ");
      }
      return string.join(',');
    },

    getAllEmployeeReportCard : function(body,callback){
      let date = body.date ? new Date(body.date) : (new Date());
      var firstDay = +new Date(date.getFullYear(), date.getMonth(), 1);
      var lastDay = +new Date(date.getFullYear(), date.getMonth() + 1, 0);
      let leaveQuery = "SELECT COUNT(*) as total_employee,SUM(a.total_leave) as total_leave,SUM(a.approved) as approved,SUM(a.rejected) as rejected,SUM(a.pending) as pending FROM employee as em ";
      leaveQuery += " LEFT JOIN (SELECT userid,COUNT(*) as total_leave,SUM(if(approve_status = 1, 1, 0)) as approved,SUM(if(approve_status = 2, 1, 0)) as rejected,SUM(if(approve_status = 0, 1, 0)) as pending FROM `leave_application` WHERE `date_from` >= "+firstDay+" AND `date_from` <= "+lastDay+" group by userid) ";
      leaveQuery += " as a ON em.userid = a.userid ";
      // leaveQuery += " GROUP BY em.userid ";
      connection.query(leaveQuery, function (error, result) {
        if (error) {
          console.log("Error#007 in 'superadminService.js'", error, leaveQuery);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          callback(null, {status: true,message: "Employee reports found successfully!!",data: result,http_code: 200});
        }
      });
    },

    getWorkingMonthsList : function(body,callback){
      let whereCondition = "1";
      if(body.user_type == 'employee'){
        whereCondition = " userid = "+body.userid;
      }
      let query = "SELECT MIN(`date`) as start_date FROM `employee_worksheet` WHERE "+whereCondition;
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#007 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          let monthlist = [];
          let start_date = result && result.length > 0 ? result[0].start_date ? result[0].start_date : (+new Date()) : (+new Date());
          let first_date = new Date(+start_date);
          let today_date = new Date();
          // check if worksheet minimum date's month and year is same as today date then only current month will be return
          if(first_date.getMonth() == today_date.getMonth() && first_date.getFullYear() == today_date.getFullYear()){
            monthlist.push({
              name:monthnamelist[first_date.getMonth()]+" "+first_date.getFullYear(),
              date: +new Date(first_date),
              month: first_date.getMonth()+1,
              year: first_date.getFullYear()
            });
          }else {
            monthlist = dateRange(first_date, today_date);
          }
          callback(null, {status: true,message: "Month list found successfully!!",data: monthlist,http_code: 200});
        }
      });
    },

    addUpdateBusinessHolidays : function(body,callback){
      var date = setDateStartAndEndTime(body.date,true);
      let query = "";
      if(body.row_id){
        query = "UPDATE `holidays` SET `name`="+connection.escape(body.name)+",`date`="+date+",`modified_on`="+env.timestamp()+" WHERE row_id = "+body.row_id;
      }else {
        query = "INSERT INTO `holidays`(`name`, `date`, `created_on`, `modified_on`) ";
        query += " VALUES ("+connection.escape(body.name)+","+date+","+env.timestamp()+","+env.timestamp()+")";
      }
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#008 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in saving data!!", data: {}, http_code: 400});
        } else {
          callback(null, {status: true,message: "Holiday details saved successfully!!",data: {},http_code: 200});
        }
      });
    },

    deleteBusinessHolidays : function(body,callback){
      if(body.row_ids && body.row_ids.length > 0){
        let query = "DELETE FROM `holidays` WHERE `row_id` IN ("+body.row_ids+")";
        connection.query(query, function (error, result) {
          if (error) {
            console.log("Error#009 in 'superadminService.js'", error, query);
            callback(error, {status: false, message: "Error in deleting data!!", data: {}, http_code: 400});
          } else {
            callback(null, {status: true,message: "Holidays deleted successfully!!",data: {},http_code: 200});
          }
        });
      }else {
        callback(null, {status: false,message: "Holiday ids not found!!",data: {},http_code: 400});
      }
    },

    getBusinessHolidayList : function(body,callback){
      let year = body.year ? parseInt(body.year) : new Date().getFullYear();
      year = year ? year : new Date().getFullYear();
      let start_date = year +"-01-01";
      let end_date = year +"-12-31";
      var sdate = setDateStartAndEndTime(start_date,true);
      // today end date
      var edate = setDateStartAndEndTime(end_date,false);
      let dates_string = superadminService.convertDateAccordingToOffset(['date'],body.offset,'');
      let offset = body.offset ? body.offset : 0;
      let query = "SELECT t.*,dayofweek(DATE_FORMAT(FROM_UNIXTIME((t.date - "+offset+")/1000), '%Y-%m-%d')) as day FROM (SELECT `row_id`, `name`, "+dates_string+", `created_on`, `modified_on` FROM `holidays` WHERE `date` >= "+sdate+" AND `date` <= "+edate+" order by date desc) as t order by date desc";
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#010 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          callback(null, {status: true,message: "Holidays list found successfully!!",data: result,http_code: 200});
        }
      });
    },

    getLeaveApplicationList : function(body,callback){
      let date = body.date ? new Date(+body.date) : (new Date());
      var firstDay = +new Date(date.getFullYear(), date.getMonth(), 1);
      var lastDay = +new Date(date.getFullYear(), date.getMonth() + 1, 0);
      let whereCondition = "";
      if(body.user_type == 'employee'){
        whereCondition = " AND a.userid = "+body.userid;
      }
      let dates_string = superadminService.convertDateAccordingToOffset(['date_from','date_to'],body.offset,'a');
      let query = "SELECT a.`row_id`, a.`userid`, a.`description`, "+dates_string+", a.`total_days`, a.`approve_status`, a.`created_on`, a.`modified_on` ,em.name,em.mobile,em.email,em.leave_credit ";
      query += " FROM `leave_application` as a "
      query += " LEFT JOIN employee as em ON a.userid = em.userid"
      query += " WHERE a.`date_from` >= "+firstDay+" AND a.`date_from` <= "+lastDay+" "+whereCondition+" ORDER BY a.`date_from` DESC";
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#015 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "Error in getting data!!", data: [], http_code: 400});
        } else {
          callback(null, {status: true,message: "leave application list found successfully!!",data: result,http_code: 200});
        }
      });
    },

    addPresentByUser : function(body,callback){
      let date = generateDateTime(body.date), userid = body.id, attendance_id = body.attendance_id;
      let query = "UPDATE `employee_attendance` SET `status`=1,`modified_on`="+env.timestamp()+" WHERE `userid` = "+userid+" AND `row_id` = "+attendance_id;
      connection.query(query,function(error,result){
        if(error){
          console.log("Error#005.1 in 'superadminService.js'",error,query);
          callback(error,{status:false,message:"#005:Error in saving data!!",data:false,http_code:400});
        }else{
          callback(null,{status:true,message:"Attendance added successfully!!",data:{},http_code:200});
        }
      });
    },

    exportEmployeeReport : function(body,callback){
      let from_date = body.from_date ? new Date(body.from_date) : new Date();
      let to_date = body.to_date ? new Date(body.to_date) : new Date();
      let monthName = monthnamelist[from_date.getMonth()];
      let year = from_date.getFullYear();
      var start_date = setDateStartAndEndTime(+from_date,true);
      var end_date = setDateStartAndEndTime(+to_date,false);

      const employeeService = require('../services/employeeService');
      let total_days = employeeService.getDaysBetween2Dates(start_date,end_date);

      let query = "SELECT em.userid,em.name,em.mobile,em.email,em.leave_credit,h.total_holidays,ifnull(la.total_leaves,0) as total_leaves,";
      query += "("+total_days+" - h.total_holidays) AS total_working_days,b.total_days as total_days_worked,";
      query += "SUM(IF(ea.status = 0, 1, 0)) AS absent,SUM(IF(ea.status = 1, 1, 0)) AS present ";
      query += " FROM `employee_attendance` AS ea ";
      query += " LEFT JOIN employee AS em ON ea.userid = em.userid ";
      query += " LEFT JOIN (SELECT COUNT(t.row_id) AS total_days,t.userid FROM (SELECT * FROM `employee_worksheet` WHERE date >= "+start_date+" AND date <= "+end_date+" GROUP BY userid,date) AS t GROUP BY t.userid) AS b ";
      query += " ON b.userid = ea.userid ";
      query += " CROSS JOIN (SELECT COUNT(*) AS total_holidays FROM `holidays` WHERE `date` >= "+start_date+" AND `date` <= "+end_date+") AS h ";
      query += " LEFT JOIN (SELECT COUNT(*) AS total_leaves,userid FROM `leave_application` WHERE `date_from` >= "+start_date+" AND `date_from` <= "+end_date+" GROUP BY userid) AS la ";
      query += " ON la.userid = ea.userid ";
      query += " WHERE ea.date >= "+start_date+" AND ea.date <= "+end_date+" GROUP BY ea.userid ";
      connection.query(query, function (error, result) {
        if (error) {
          console.log("Error#200 in 'superadminService.js'", error, query);
          callback(error, {status: false, message: "#200:Error in downloading data!!", data: [], http_code: 400});
        } else {
          let headerTextArray=['S.No.','Employee Name','Mobile','Email','Leave Credit','Total Holidays','Total Leaves','Total Working Days','Total Days Worked','Present','Absent'];
          let columnKeys = ['A','B','C','D','E','F','G','H','I','J','K'];
          let headerKeys = ['s_no','name','mobile','email','leave_credit','total_holidays','total_leaves','total_working_days','total_days_worked','present','absent'];
          mkdirp(env.downloadPath, function(err) {
            if(err){
              console.log("Error#201 in 'superadminService.js'", err);
              callback(err, {status: false, message: "#201:Error in downloading data!!", data: [], http_code: 400});
            }else {
              let filename = "Report_"+monthName+"_"+year+"_"+(+new Date())+".xlsx";
              let filepath = env.downloadPath+'/'+filename;
              let dataToExport = {};
              async.eachOf(result,function(d,ci,cb){
                d.s_no = ci+1;
                for (var i = 0; i < columnKeys.length; i++) {
                  let key = columnKeys[i];
                  if(!dataToExport[key]){
                    dataToExport[key] = [];
                  }
                  dataToExport[key].push([d[headerKeys[i]]]);
                }
                cb();
              },function(error){
                if(error){
                  console.log("Error#202 in 'superadminService.js'", error);
                  callback(error, {status: false, message: "#202:Error in downloading data!!", data: [], http_code: 400});
                }else{
                  XlsxPopulate.fromBlankAsync().then(function(workbook){
                    for (var i = 0; i < columnKeys.length; i++) {
                      workbook.sheet("Sheet1").cell(columnKeys[i]+"1").value(headerTextArray[i]);
                      let range = columnKeys[i]+"2:"+columnKeys[i]+(result.length + 1);
                      workbook.sheet('Sheet1').range(range).value(dataToExport[columnKeys[i]]);
                    }
                    return workbook.toFileAsync(filepath);
                  }).then(function(){
                    console.log('report file cretaed');
                    callback(null, {status: true,message: "Report created successfully!!",data: filename,http_code: 200});
                  });
                }
              });
            }
          });
        }
      });
    },
};
module.exports = superadminService;

function dateRange(startDate, endDate) {
  var startYear  = startDate.getFullYear();
  var endYear    = endDate.getFullYear();
  var startMonth = startDate.getMonth();
  var endMonth = endDate.getMonth();
  var dates      = [];

  for(var i = startYear; i <= endYear; i++) {
    var endMonth = i != endYear ? 11 : endMonth;
    var startMon = i === startYear ? startMonth : 0;
    for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
      var month = j+1;
      var displayMonth = month < 10 ? '0'+month : month;
      let currentMonthDate = [i, displayMonth, '01'].join('-');
      dates.push({
        name:monthnamelist[j]+" "+i,
        date:(+new Date(currentMonthDate)),
        month: month,
        year: i
      });
    }
  }
  return dates;
}

function ValidateEmail(mail) {
  const mailformat = /^\w+([\+.-]?\w+)*@\w+([\+.-]?\w+)*(\.\w{2,3})*(\.\w+)+$/; ///^\w+([\+.-]?\w+)*@\w+([\+.-]?\w+)*(\.\w{2,3})+$/
  if (mail && mail.match(mailformat)) {
      return true;
  }
  return false;
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

// 1. hr login
//  - list of employeeds in a table - aggird
//  - on click on a user in the list, hr should be  able to see the details of that user
//         - name, mobile no.
//         - docments set zip file  - hr can uplooad
//         - 10 fields ( date of joining, increament date - salary,  left date)
//         - Total leaves in hand - (monthly wise, we can see how the employee took holidays)
//
// - Leave application - monthly wise - (approved button ) - (date filter) - latest come first
//
// - Report on monythly baiss - april 2021 - manglesh - total working days - 22 (days)  - leaves application total days - 3
//
//
//
// 2. employees login
//     - name, mobile no.
//     - 10 fields ( date of joining, increament date - salary,  left date)
//     - Total leaves in hand - (monthly wise, we can see how the employee took holidays )
//     - LEave application add  - from and to date filed -
//     - Daily work sheet - Old can be edited and added

//********** employee wise list per day ***************

// SELECT em.userid,em.name,em.mobile,em.email, a.date,DATE_FORMAT(from_unixtime(a.date/1000),'%d-%m-%Y') as formatted_date, b.total_days
// FROM `employee_worksheet` as a
// LEFT JOIN employee as em ON a.userid = em.userid
// LEFT JOIN (SELECT COUNT(t.row_id) as total_days,t.userid FROM (SELECT * FROM `employee_worksheet` GROUP BY userid,date) as t GROUP BY t.userid) as b ON b.userid = a.userid
// GROUP BY a.userid,a.date

//********** employee wise total working days ***************
// SELECT em.userid,em.name,em.mobile,em.email,COUNT(t.row_id) as total_days,t.userid FROM (SELECT * FROM `employee_worksheet` GROUP BY userid,date) as t
// LEFT JOIN employee as em ON t.userid = em.userid
// GROUP BY t.userid
