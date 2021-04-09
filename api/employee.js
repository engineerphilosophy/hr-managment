const express = require('express');
const router = express.Router();
const employeeService = require('./services/employeeService');
const superadminService = require('./services/superadminService');
/**
 * @api {get} /employee/getEmployeeDetailsById get employee details by id
 * @apiName getEmployeeDetailsById
 * @apiGroup employee
 *
 * @apiAuthor Manglesh Patel - 04/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} id employee id
 *
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Employee details found successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Employee details found successfully!!",
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
router.get('/getEmployeeDetailsById', function(req, res) {
  if(req.query.id){
    req.body.id = req.query.id;
    superadminService.getEmployeeDetailsById(req.body,function (error,data_response) {
      if (error) {
        console.log('error in getEmployeeDetailsById---employee.js-',error);
        res.json(data_response);
      } else {
        res.json(data_response);
      }
    });
  }else {
    res.json({ status: false, message: "id not found", data: {}, http_code: 400 });
  }
});

/**
 * @api {get} /employee/getWorkingMonthsList get working months list
 * @apiName getWorkingMonthsList
 * @apiGroup employee
 *
 * @apiAuthor Manglesh Patel - 04/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Month list found successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Month list found successfully!!",
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
router.get('/getWorkingMonthsList', function(req, res) {
  req.body = Object.assign(req.body,req.query);
  superadminService.getWorkingMonthsList(req.body,function (error,data_response) {
    if (error) {
      console.log('error in getWorkingMonthsList---employee.js-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});
/**
 * @api {get} /employee/getEmployeesDailyWorksheetData get employees daily work data
 * @apiName getEmployeesDailyWorksheetData
 * @apiGroup employee
 *
 * @apiAuthor Manglesh Patel - 04/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} id employee id (required if want to fetch data according to user)
 * @apiParam {Number} monthly 1 if want to get monthly report else 0
 * @apiParam {Number} daily 1 if wants to get daily report else 0
 * @apiParam {Number} date date of month or day (default is today date)
 *
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Employee worksheet data found successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Employee worksheet data found successfully!!",
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
router.get('/getEmployeesDailyWorksheetData', function(req, res) {
  req.body = Object.assign(req.body,req.query);
  superadminService.getEmployeesDailyWorksheetData(req.body,function (error,data_response) {
    if (error) {
      console.log('error in getEmployeesDailyWorksheetData---employee.js-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});

/**
 * @api {post} /employee/addUpdateDailyWorkData add update daily work data
 * @apiName addUpdateDailyWorkData
 * @apiGroup employee
 *
 * @apiAuthor Manglesh Patel - 06/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} date timestamp date of work
 * @apiParam {Array} work_data array of objects consist of row_id (if editing else 0),module,description,start_time,end_time
 *
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Work data saved successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Work data saved successfully!!",
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
router.post('/addUpdateDailyWorkData', function(req, res) {
  employeeService.addUpdateDailyWorkData(req.body,function (error,data_response) {
    if (error) {
      console.log('error in addUpdateDailyWorkData---employee.js-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});
/**
 * @api {post} /employee/addUpdateLeaveApplication add update leave application
 * @apiName addUpdateLeaveApplication
 * @apiGroup employee
 *
 * @apiAuthor Manglesh Patel - 06/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} row_id required if editing application else 0
 * @apiParam {Number} description leave application description
 * @apiParam {Number} date_from leave start date
 * @apiParam {Number} date_to leave end date
 * @apiParam {Number} total_days total leave days
 *
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Leave application saved successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Leave application saved successfully!!",
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
router.post('/addUpdateLeaveApplication', function(req, res) {
  employeeService.addUpdateLeaveApplication(req.body,function (error,data_response) {
    if (error) {
      console.log('error in addUpdateLeaveApplication---employee.js-',error);
      res.json(data_response);
    } else {
      res.json(data_response);
    }
  });
});
/**
 * @api {get} /employee/getEmployeesDailyWorkByDate get employees daily work data by date
 * @apiName getEmployeesDailyWorkByDate
 * @apiGroup employee
 *
 * @apiAuthor Manglesh Patel - 08/04/2021
 *
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} Authorization user token
 *
 * @apiParam {Number} date timestamp date
 *
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Employee worksheet data found successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Employee worksheet data found successfully!!",
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
router.get('/getEmployeesDailyWorkByDate', function(req, res) {
  if(req.query.date){
    req.body = Object.assign(req.body,req.query);
    employeeService.getEmployeesDailyWorkByDate(req.body,function (error,data_response) {
      if (error) {
        console.log('error in getEmployeesDailyWorkByDate---employee.js-',error);
        res.json(data_response);
      } else {
        res.json(data_response);
      }
    });
  }else {
    res.json({ status: false, message: "date not found", data: {}, http_code: 400 });
  }
});
module.exports = router;
