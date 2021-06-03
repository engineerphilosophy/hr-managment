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
// var job = new CronJob('check_expiry_date','*/05 * * * * *',checkAndUpdateEmployeesLeaveCredit,{start:true}); //every 5 second for testing
var job = new CronJob('check_expiry_date','05 0 1 * *',checkAndUpdateEmployeesLeaveCredit,{start:true}); // 05 0 1 * * - every month 1st day at 12:05 am
function checkAndUpdateEmployeesLeaveCredit(){
  let timeof2day = 2*60*60*24*1000;
  let todaydate = new Date(env.timestamp() - timeof2day);
  var firstDay = +new Date(todaydate.getFullYear(), todaydate.getMonth(), 1);
  var lastDay = +new Date(todaydate.getFullYear(), todaydate.getMonth() + 1, 0);
  let total_days = employeeService.getDaysBetween2Dates(firstDay,lastDay);
  let leaveQuery = "SELECT em.*,la.total_leave,b.total_days FROM employee as em ";
  leaveQuery += " LEFT JOIN (SELECT COUNT(t.row_id) as total_days,t.userid FROM (SELECT * FROM `employee_worksheet` WHERE date >= "+firstDay+" and date <= "+lastDay+"  GROUP BY userid,date) as t GROUP BY t.userid) as b ON b.userid = em.userid ";
  leaveQuery += " LEFT JOIN (SELECT COUNT(*) as total_leave,userid FROM `leave_application` WHERE `date_from`>= "+firstDay+" AND `date_from`<= "+lastDay+") as la ON la.userid = em.userid ";
  leaveQuery += " ;";
  leaveQuery += " SELECT COUNT(*) as total_holidays FROM `holidays` WHERE `date`>= "+firstDay+" AND `date`<= "+lastDay+" ";
  connection.query(leaveQuery, function (error, result1) {
    if (error) {
      console.log("Error#001 in 'cronjobForLeaveCredit.js'", error, leaveQuery);
    } else {
      let result = result1[0];
      let total_holidays = result1[1] && result1[1].length > 0 ? result1[1][0].total_holidays : 0;
      let total_working_days = total_days - parseInt(total_holidays);
      if(result && result.length > 0){
        async.eachSeries(result,function(user,cb){
          let leave_credit = parseInt(user.leave_credit);
          let actual_leave = 0;
          if(leave_credit <= 0){
            leave_credit = 0;
          }
          let current_leave = 0;
          let leaves = total_working_days - user.total_days;
          // check if leaves are taken in this month or not
          user.total_leave = user.total_leave ? parseInt(user.total_leave) : 0;
          // add 1 in leave credit for this month leave credit
          let actual_leaves = leaves && leaves>0 ? leaves : 0;
          if(actual_leaves == user.total_leave){
            current_leave = (leave_credit + monthly_leave_credit) - user.total_leave;
          }else {
            current_leave = (leave_credit + monthly_leave_credit) - actual_leaves;
          }
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
