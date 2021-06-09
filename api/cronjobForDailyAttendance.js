// Author - Manglesh Patel
// Date - 14 April 2021
// Description - Cronjob to update employees leave credit
const monthly_leave_credit = 1; //every employee is having 1 day for leave in every month
var express = require('express');
var router = express.Router();
var async = require('async');
var env = require('./env');
var underscore = require('underscore');
var connection = env.dbconnection;
var CronJob = require('cron-job-manager');
const employeeService = require('./services/employeeService');
// var job = new CronJob('check_expiry_date','*/05 * * * * *',checkAndUpdateEmployeesAttendance,{start:true}); //every 5 second for testing
var job = new CronJob('check_expiry_date','10 0 * * *',checkAndUpdateEmployeesAttendance,{start:true}); // 05 0 1 * * - every month 1st day at 12:05 am
function checkAndUpdateEmployeesAttendance(){
  let timeof12hour = 12*60*60*1000;
  let todaydate = new Date(env.timestamp() - timeof12hour);
  let start = new Date(todaydate);
  start.setHours(0,0,0,0);
  var sdate = +new Date(start);
  // end date
  let end = new Date(todaydate);
  end.setHours(23,59,59,999);
  var edate = +new Date(end);

  let attendanceQuery = "SELECT em.userid,em.email,ea.status,ea.date,b.total_days,la.total_leave  FROM employee as em ";
  attendanceQuery += " LEFT JOIN employee_attendance as ea ON em.userid = ea.userid AND ea.date >= "+sdate+" and ea.date <= "+edate+" ";
  attendanceQuery += " LEFT JOIN (SELECT COUNT(t.row_id) as total_days,t.userid FROM (SELECT * FROM `employee_worksheet` WHERE date >= "+sdate+" and date <= "+edate+"  GROUP BY userid,date) as t GROUP BY t.userid) as b ON b.userid = em.userid ";
  attendanceQuery += " LEFT JOIN (SELECT COUNT(*) as total_leave,userid FROM `leave_application` WHERE `date_from`>= "+sdate+" AND `date_from`<= "+edate+") as la ON la.userid = em.userid ";
  attendanceQuery += " GROUP BY em.userid ";

  attendanceQuery += ";SELECT * FROM `holidays` WHERE `date`>= "+sdate+" AND `date`<= "+edate+" ";
  connection.query(attendanceQuery, function (error, result1) {
    if (error) {
      console.log("Error#001 in 'cronjobForDailyAttendance.js'", error, attendanceQuery);
    } else {
      let result = result1[0];
      let holidays = result1[1] && result1[1].length > 0 ? result1[1] : [];
      if(result && result.length > 0){
        async.eachSeries(result,function(user,cb){
          if(user.status && user.date){
            // check if user added today work then nothing to do
            cb();
          }else {
            if(holidays && holidays.length>0){
              // if today is holiday then we will not insert data
              cb();
            }else {
              user.date = todaydate;
              employeeService.addUpdateEmployeeAttendence(user,function(error,response){
                if (error) {
                  console.log("Error#002 in 'cronjobForDailyAttendance.js'", error, employeeQuery);
                  cb(error);
                } else {
                  cb();
                }
              })
            }
          }
        },function(error){
          console.log('Empoyee daily attendance is updated!!');
        });
      }else {
        console.log("Empoyee not found!!");
      }
    }
  });
}

module.exports = router;
