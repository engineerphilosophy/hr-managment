var env = require('./api/env');
var connection = env.dbconnection;
var async = require('async');

// steps:-
// select from employee_worksheet table group by dates
// select from holidays table
// and insert the uniq rows based on userid, date and add Attendance status
let from_date = "2021-05-01";
let todaydate = new Date();
var year  = todaydate.getFullYear();
var month = todaydate.getMonth() > 9 ? todaydate.getMonth()+1 : "0"+(todaydate.getMonth()+1);
var day = todaydate.getDate() > 9 ? todaydate.getDate() : "0"+(todaydate.getDate());
let to_date = year+"-"+month+"-"+day;

var query1 =  " select *,(UNIX_TIMESTAMP(selected_date)*1000) as timestamp_date from ";
query1 += " (select adddate('1970-01-01',t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) selected_date from ";
query1 += " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0, ";
query1 += " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1, ";
query1 += " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2, ";
query1 += " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3, ";
query1 += " (select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) v ";
query1 += " where selected_date between '"+from_date+"' and '"+to_date+"'";
connection.query(query1,function(error,result){
  if (error) {
    console.log("error in first query1 ",query1);
  }else {
      if(result.length){
         async.eachSeries(result,function(o,cb){
           let newDate = new Date(o.timestamp_date);
           newDate.setHours(0,0,0,0);
           let start_date = +new Date(newDate);
           newDate.setHours(23,59,59,999);
           let end_date = +new Date(newDate);
           let query = "SELECT em.userid,ew.date,h.date as holiday FROM employee as em ";
           query += " LEFT JOIN employee_worksheet as ew ON ew.userid = em.userid AND ew.date >= "+start_date+" AND ew.date <= "+end_date+" ";
           query += " LEFT JOIN holidays as h ON h.date = ew.date ";
           query += " GROUP BY ew.date,em.userid ";
           connection.query(query,function(error,employees){
             if (error) {
               console.log("error in second query ",query);
               cb();
             }else {
               async.eachSeries(employees,function(single,cb1){
                 if(single.userid){
                   let extra_day = single.holiday ? 1 : 0;
                   let status = single.date ? 1 : 0;
                   let date = single.date ? single.date : start_date;
                   console.log('start_date---',start_date);
                   console.log('date---',date,single.date);
                   let insertQuery = "INSERT INTO `employee_attendance`(`userid`, `date`, `status`, extra_day,`modified_on`, `created_on`) ";
                   insertQuery += " VALUES ("+single.userid+","+date+","+status+","+extra_day+","+env.timestamp()+","+env.timestamp()+")";
                   insertQuery += " ON DUPLICATE KEY UPDATE status= VALUES(status), modified_on= VALUES(modified_on) ";
                   connection.query(insertQuery,function(error,result){
                     if(error){
                       console.log("Error#005.1 in 'employeeService.js'",error,insertQuery);
                       cb1();
                     }else{
                       cb1();
                     }
                   });
                 }else {
                   cb1();
                 }
               },function(error){
                 cb();
               });
             }
           });
         },function(error){
             if(!error){
               console.log("done done");
             }
         })
      }else {
        console.log("no data to update");
      }
  }
})
