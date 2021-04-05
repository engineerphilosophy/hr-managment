//Created by   :- Manglesh Patel
//Created Date :- 01-04-2021
//Description  :- api list with access roles
var api_list = {
  ////////// super admin api start //////////
  'getEmployeeList':['superadmin'],
  'getEmployeeDetailsById':['superadmin'],
  'addUpdateEmployeeDetails':['superadmin'],
  'endEmployeeSession':['superadmin'],
  'approveLeaveApplication':['superadmin'],
  'getEmployeesDailyWorksheetData':['superadmin'],
  'getAllEmployeeReportCard':['superadmin'],
  'getWorkingMonthsList':['superadmin'],
  'uploadZipDocument':['superadmin'],
  ////////// super admin api end //////////
};

module.exports = api_list;
