const express = require('express');
const router = express.Router();
const superadminService = require('./services/superadminService');
const zipupload = require('./zipupload');

/**
 * @api {get} /superadmin/getEmployeeList get employee list
 * @apiName getEmployeeList
 * @apiGroup superadmin
 *
 * @apiAuthor Manglesh Patel - 04/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Employee list found successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Employee list found successfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Error in getting data!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Error in getting data!!",
 *       "data": {},
 *     }
 */
router.get('/getEmployeeList', function(req, res) {
  superadminService.getEmployeeList(req.body,function (error,data_response) {
    if (error) {
      console.log('error in getEmployeeList---superadmin-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});

/**
 * @api {post} /superadmin/addUpdateEmployeeDetails add update employee details
 * @apiName addUpdateEmployeeDetails
 * @apiGroup superadmin
 *
 * @apiAuthor Manglesh Patel - 04/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} id employee id (required if updating employee details else 0)
 * @apiParam {String} name employee full name
 * @apiParam {String} mobile employee mobile
 * @apiParam {String} email employee email
 * @apiParam {Number} salary employee salary
 * @apiParam {Number} leave_credit leave credit
 * @apiParam {Number} start_date start date
 * @apiParam {Number} increament_date employee increament date
 * @apiParam {String} document employee document zip file name
 * @apiParam {String} password password
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Employee details saved successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Employee details saved successfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Error in saving data!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Error in saving data!!",
 *       "data": {},
 *     }
 */
router.post('/addUpdateEmployeeDetails', function(req, res) {
  superadminService.addUpdateEmployeeDetails(req.body,function (error,data_response) {
    if (error) {
      console.log('error in addUpdateEmployeeDetails---superadmin-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});

/**
 * @api {post} /superadmin/endEmployeeSession end employee working session
 * @apiName endEmployeeSession
 * @apiGroup superadmin
 *
 * @apiAuthor Manglesh Patel - 04/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} id employee id
 * @apiParam {Number} end_date end date
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Employee session updated successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Employee session updated successfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Error in saving data!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Error in saving data!!",
 *       "data": {},
 *     }
 */
router.post('/endEmployeeSession', function(req, res) {
  superadminService.endEmployeeSession(req.body,function (error,data_response) {
    if (error) {
      console.log('error in endEmployeeSession---superadmin-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});

/**
 * @api {post} /superadmin/approveLeaveApplication approve leave application
 * @apiName approveLeaveApplication
 * @apiGroup superadmin
 *
 * @apiAuthor Manglesh Patel - 04/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} id employee id
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Employee leave application approved successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Employee leave application approved successfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Error in saving data!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Error in saving data!!",
 *       "data": {},
 *     }
 */
router.post('/approveLeaveApplication', function(req, res) {
  superadminService.approveLeaveApplication(req.body,function (error,data_response) {
    if (error) {
      console.log('error in approveLeaveApplication---superadmin-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});

/**
 * @api {get} /superadmin/getAllEmployeeReportCard get employees report card
 * @apiName getAllEmployeeReportCard
 * @apiGroup superadmin
 *
 * @apiAuthor Manglesh Patel - 04/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} date date of month
 *
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Employee reports found successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Employee reports found successfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Error in getting data!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Error in getting data!!",
 *       "data": {},
 *     }
 */
router.get('/getAllEmployeeReportCard', function(req, res) {
  // if(req.query.date){
    req.body = Object.assign(req.body,req.query);
    superadminService.getAllEmployeeReportCard(req.body,function (error,data_response) {
      if (error) {
        console.log('error in getAllEmployeeReportCard---superadmin-',error);
        res.json(data_response);
      } else {
        res.json(data_response);
      }
    });
  // }else {
  //   res.json({ status: false, message: "date not found", data: {}, http_code: 400 });
  // }
});

/**
 * @api {post} /superadmin/uploadZipDocument upload zip document
 * @apiName uploadZipDocument
 * @apiGroup superadmin
 *
 * @apiAuthor Manglesh Patel - 04/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} id employee id
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Document uploaded succesfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Document uploaded succesfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Wrong extension type. Allowed extension types are .zip!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Wrong extension type. Allowed extension types are .zip!!",
 *       "data": {},
 *     }
 */
router.post('/uploadZipDocument',function(req,res){
  zipupload(req,res,function(error){
    if(error){
      console.log("Error#008 in 'superadmin.js'",error);
      var responsedata = {
        status:false,
        http_code:400,
        data:{},
        message:"Wrong extension type. Allowed extension types are .zip!!"
      };
      res.jsonp(responsedata);
    }else{
      var filename = req.file.filename;
      var filepath = req.file.path;
      var responsedata = {
        status:true,
        http_code:200,
        data:{filename:filename},
        message:"Document uploaded succesfully!!"
      };
      res.jsonp(responsedata);
    }
  })
});
/**
 * @api {post} /superadmin/addUpdateBusinessHolidays add update business holidays
 * @apiName addUpdateBusinessHolidays
 * @apiGroup superadmin
 *
 * @apiAuthor Manglesh Patel - 08/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} row_id holiday id (required if updating holiday details else 0)
 * @apiParam {String} name holiday name
 * @apiParam {String} date holiday date
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Holiday details saved successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Holiday details saved successfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Error in saving data!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Error in saving data!!",
 *       "data": {},
 *     }
 */
router.post('/addUpdateBusinessHolidays', function(req, res) {
  superadminService.addUpdateBusinessHolidays(req.body,function (error,data_response) {
    if (error) {
      console.log('error in addUpdateBusinessHolidays---superadmin-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});
/**
 * @api {post} /superadmin/deleteBusinessHolidays delete business holidays
 * @apiName deleteBusinessHolidays
 * @apiGroup superadmin
 *
 * @apiAuthor Manglesh Patel - 08/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Array} row_ids array of holidays row ids
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Holidays deleted successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Holidays deleted successfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Error in deleting data!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Error in deleting data!!",
 *       "data": {},
 *     }
 */
router.post('/deleteBusinessHolidays', function(req, res) {
  superadminService.deleteBusinessHolidays(req.body,function (error,data_response) {
    if (error) {
      console.log('error in deleteBusinessHolidays---superadmin-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});
/**
 * @api {get} /superadmin/getBusinessHolidayList get business holidays list
 * @apiName getBusinessHolidayList
 * @apiGroup superadmin
 *
 * @apiAuthor Manglesh Patel - 08/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} year year for which you are getting data. default is current year
 *
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Holidays list found successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Holidays list found successfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Error in getting data!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Error in getting data!!",
 *       "data": {},
 *     }
 */
router.get('/getBusinessHolidayList', function(req, res) {
  req.body = Object.assign(req.body,req.query);
  superadminService.getBusinessHolidayList(req.body,function (error,data_response) {
    if (error) {
      console.log('error in getBusinessHolidayList---superadmin-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});
module.exports = router;
