//Created by   :- Manglesh Patel
//Created Date :- 01-04-2021
//Description  :- api list with access roles
var api_list = {
  ////////// super admin api start //////////
  'getEmployeeList':['superadmin'],
  'getEmployeeDetailsById':['superadmin','employee'],
  'addUpdateEmployeeDetails':['superadmin'],
  'endEmployeeSession':['superadmin'],
  'approveLeaveApplication':['superadmin'],
  'getEmployeesDailyWorksheetData':['superadmin','employee'],
  'getAllEmployeeReportCard':['superadmin'],
  'getWorkingMonthsList':['superadmin','employee'],
  'uploadZipDocument':['superadmin'],
  ////////// super admin api end //////////
  'addUpdateDailyWorkData':['employee'],
  'addUpdateDailyWorkData':['employee'],
  'addUpdateDailyWorkData':['employee'],
  'addUpdateDailyWorkData':['employee'],
};

module.exports = api_list;
