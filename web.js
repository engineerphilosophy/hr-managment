var request = require('request');
var env = require('./api/env');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var device = require('express-device');
const path = require('path');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server,{'transports': ['websocket', 'polling']});//to handle bad request for socket io
app.use(device.capture());

var port = env.port;

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());


app.use(csrf({ cookie: true }));
// //after-----------------------------------
app.use(function(req,res,next){
  //this is called on every request
  var token = req.csrfToken();
  res.cookie("XSRF-TOKEN",token,{secure:true});
  res.locals.csrfToken = token;
  next();
})

app.use(function (err,req, res, next) {
  next();
  //this is called when csrf token does not match
  // if(err && req.headers.frommobile){
  //   next();
  // }else{
  //   res.status(401);
  //   res.send({status:"Invalid user"});
  // }
});

//to secure /user_downloads folder
app.all('/user_downloads/*',[require('./api/validateRequest')]);

app.use('/assets', express.static(__dirname + '/assets'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/csv', express.static(__dirname + '/sample_xlsx_templates'));
app.use('/guides', express.static(__dirname + '/step_guides'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/user_downloads', express.static(__dirname + '/user_downloads'));
app.use('/ngflow', express.static(__dirname + '/ng-flow'));

var employeelogin = require('./api/employeelogin.js');
var superadminlogin = require('./api/superadminlogin.js');
var superadmin = require('./api/superadmin.js');
var employee = require('./api/employee.js');
var logout = require('./api/logout.js');
var cronjobForLeaveCredit = require('./api/cronjobForLeaveCredit.js');
var cronjobForDailyAttendance = require('./api/cronjobForDailyAttendance.js');
var cors = require('cors');

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'GET,POST');
 // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
 // res.header('X-Frame-Options', 'SAMEORIGIN');
 // res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Content-Type-Options', 'nosniff')
  // res.header('Content-Security-Policy', "script-src 'self'");
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.removeHeader('x-powered-by');
  res.removeHeader('Server');
  next();
});

// Make io accessible to our router
app.use(function(req,res,next){
  // req.socket = socket;
  req.io = io;
  next();
});
app.use(cors());
app.options('*', cors());
///////////////
app.use('/api/employeelogin', employeelogin);
app.use('/api/superadminlogin', superadminlogin);
app.all('*', [require('./api/validateRequest')]);

app.use('/api/logout', logout);
app.use('/api/employee', employee);
app.use('/api/superadmin',superadmin);
app.use('/api/cronjobForLeaveCredit',cronjobForLeaveCredit);
app.use('/api/cronjobForDailyAttendance',cronjobForDailyAttendance);

io.on('connection',function(socket){
  socket.on('user',function(identity){
    connectedUsers[identity.user] = socket;
  })
})

server = server.listen(port);
server.timeout = 1000000;
console.log('Magic happens at port : ' + port);
module.exports = app;
