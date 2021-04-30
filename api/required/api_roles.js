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
  'addUpdateBusinessHolidays':['superadmin'],
  'deleteBusinessHolidays':['superadmin'],
  'getLeaveApplicationList':['superadmin'],
  'getBusinessHolidayList':['superadmin','employee'],
  'logout':['superadmin','employee'],
  'downloadFile':['superadmin'],
  ////////// super admin api end //////////
  ////////// employee api start //////////
  'addUpdateDailyWorkData':['employee'],
  'addUpdateLeaveApplication':['employee'],
  'getEmployeesDailyWorkById':['employee'],
  'addUpdateDailyWorkData':['employee'],
  'getEmployeesDailyWorkByDate':['employee'],
  'updatePassword':['employee','superadmin'],
  'getLeaveApplicationListByEmployee':['employee'],
  'deleteDailyWorkData':['employee'],
  'deleteLeaveApplication':['employee'],
  'getEmployeeReportCard':['employee'],
  ////////// employee api end //////////
};

module.exports = api_list;
