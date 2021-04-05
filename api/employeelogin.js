const express = require('express');
const router = express.Router();
const employeeService = require('./services/employeeService');

/**
 * @api {post} /employeelogin/login
 * @apiName login
 * @apiGroup employeelogin
 *
 * @apiAuthor Manglesh Patel - 01/04/2021
 *
 * @apiVersion 0.0.1
 *
 *
 * @apiParam {String} username user email id
 * @apiParam {String} password password
 *
 * @apiSuccess {Boolean} status true.
 * @apiSuccess {Number} http_code  200.
 * @apiSuccess {Object} data  [] .
 * @apiSuccess {String} message Employee logged-in successfully!!
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "http_code": 200,
 *       "message": "Employee logged-in successfully!!",
 *       "data": [],
 *     }
 *
 * @apiError {Boolean} status false.
 * @apiError {Number} http_code  400.
 * @apiError {Object} data  blank object.
 * @apiError {String} message Error in login!!
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Not Found
 *     {
 *       "status": false,
 *       "http_code": 400,
 *       "message": "Error in login!!",
 *       "data": {},
 *     }
 */
router.post('/login',function(req,res){
  employeeService.loginEmployee(req.body,function (error,data_response) {
      if (error) {
        console.log('error in login---employeelogin-',error);
        res.json(data_response);
      } else {
        res.json(data_response);
      }
  });
});
module.exports = router;
