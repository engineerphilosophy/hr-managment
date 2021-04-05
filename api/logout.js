var express = require('express');
var router = express.Router();
var env = require('./env');
var connection = env.dbconnection;

router.post('/logout',function(req,res){
  var query = "delete from logged_in_users where userid = "+req.body.userid+" and user_type = '"+req.body.user_type+"'";
  connection.query(query,function(error,result){
    if(error){
      console.log("error in deleting data from logged_in_users",error);
      res.jsonp({status:true,http_code:200,data:{},message:"Logged out successfully!!"});
    }else{
      console.log("row deleted");
      res.jsonp({status:true,http_code:200,data:{},message:"Logged out successfully!!"});
    }
  })
})

module.exports = router;
