
var mysql = require('mysql');
var nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
var env = process.env.NODE_ENV;
var projectPath = process.env.PROJECT_PATH;

var hostName = process.env.HOST_NAME;

var enviroment = {
  uploadPath : projectPath + "uploads/",
  downloadPath : projectPath + "uploads/reports",
  projectPath: projectPath,
  host : hostName,
  port:process.env.PORT,
  env_type:process.env.NODE_ENV,
  NODE_ENV:process.env.NODE_ENV,
  accessible_user_ids:[],
  timestamp: function() {
    var UTCtimestamp = new Date();
    return UTCtimestamp.getTime();
  },
  dbconnection: mysql.createPool({
    database : process.env.DATABASE,
    user : process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    host : process.env.DB_HOST,
    multipleStatements: true
  }),
  env_name:env,
};
enviroment.env_type = process.env.ENV_TYPE;
enviroment.transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  requireTLS:true,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
module.exports = enviroment;
