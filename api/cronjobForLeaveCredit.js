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
// var job = new CronJob('check_expiry_date','*/05 * * * * *',checkAndUpdateEmployeesLeaveCredit,{start:true}); //every 5 second for testing
var job = new CronJob('check_expiry_date','05 0 1 * *',checkAndUpdateEmployeesLeaveCredit,{start:true}); // 05 0 1 * * - every month 1st day at 12:05 am
function checkAndUpdateEmployeesLeaveCredit(){
  let timeof2day = 2*60*60*24*1000;
  let todaydate = env.timestamp() - timeof2day;
  var firstDay = +new Date(todaydate.getFullYear(), todaydate.getMonth(), 1);
  var lastDay = +new Date(todaydate.getFullYear(), todaydate.getMonth() + 1, 0);
  let leaveQuery = "SELECT em.*,a.total_leave FROM employee as em ";
  leaveQuery += " LEFT JOIN (SELECT *,COUNT(*) as total_leave FROM `leave_application` WHERE `date_from` >= "+firstDay+" AND `date_from` <= "+lastDay+" GROUP BY userid) ";
  leaveQuery += " as a ON em.userid = a.userid ";
  connection.query(leaveQuery, function (error, result) {
    if (error) {
      console.log("Error#001 in 'cronjobForLeaveCredit.js'", error, leaveQuery);
    } else {
      if(result && result.length > 0){
        async.eachSeries(result,function(user,cb){
          let leave_credit = parseInt(user.leave_credit);
          let actual_leave = 0;
          if(leave_credit <= 0){
            leave_credit = 0;
          }
          let current_leave = 0;
          // check if leaves are taken in this month or not
          user.total_leave = user.total_leave ? parseInt(user.total_leave) : 0;
          // add 1 in leave credit for this month leave credit
          current_leave = (leave_credit + monthly_leave_credit) - user.total_leave;
          actual_leave = current_leave;

          current_leave = current_leave < 0 ? 0 : current_leave;

          let logsQuery = "INSERT INTO `monthly_leave_logs` (`userid`, `leave_credit`, `actual_leave`, `total_leave`, `month_date`, `created_on`) ";
          logsQuery += " VALUES ("+user.userid+","+current_leave+","+actual_leave+","+user.total_leave+","+firstDay+","+env.timestamp()+")";

          let employeeQuery = "UPDATE `employee` SET `leave_credit` = "+current_leave+",`modified_on`="+env.timestamp()+" WHERE `userid`="+user.userid;
          connection.query(employeeQuery, function (error, result) {
            if (error) {
              console.log("Error#002 in 'cronjobForLeaveCredit.js'", error, employeeQuery);
              cb(error);
            } else {
              connection.query(logsQuery, function (error, result1) {
                if (error) {
                  console.log("Error#003 in 'cronjobForLeaveCredit.js'", error, logsQuery);
                  cb(error);
                } else {
                  cb();
                }
              });
            }
          });
        },function(error){
          console.log('Empoyee leave credit is updated!!');
        });
      }else {
        console.log("leaves not found!!");
      }
    }
  });
}

module.exports = router;
