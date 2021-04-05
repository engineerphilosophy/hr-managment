var env = require('./env');
var db = env.dbconnection;
var CRUD = require('mysql-crud');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var superSecret = require('./secret').secret;

var common_functions = {

  genToken: function(user_data){
    let expiresIn = "24h";
    var token = jwt.sign(user_data, superSecret, {
      expiresIn: expiresIn // change it to refresh token for mobile user.
    });
    return token;
  },

  decodeToken: function(header){
    //var token = header.split(' ')[1];
    var decoded = jwt.decode(header);
    return decoded;
  },
  getRandomSpan : function() {
      return Math.floor((Math.random() * 99999999999) + 1);
    },
  generatePassword:function(){
    return getRandomString();
  },
  getUniques:function (arr,col){
    let all = common_functions.pluck(arr,col);
    return all.reduce(function(a,v){
      if(a.indexOf(v) == -1){
        a.push(v);
      }
      return a;
    },[]);
  },
  pluck:function(arr,col){
    let all = arr.map(function(d){
      return d[col] ? d[col].toString().trim() : d[col];
    });
    return all;
  },
  filter:function(arr,col){
    return arr.filter(function(d){ if(d[col]) return d;})
  }
};

function getRandomString(){
  var sp_char_array = ['#','$','%','&','!','@','^','-','_','+'],letter_case_array = ['caps','small'],str = '';
  var sp_char = sp_char_array[Math.floor(Math.random()*10)];
  var passwordLength = getRandomNumberBetween(12,8);
  var rand_no = getRandomNumberBetween(passwordLength-1,3);
  for(var i=0;i<passwordLength;i++){
    if(i==rand_no){
      str += sp_char;
    }else{
      var char = getRandomNumberBetween(2,0);
      switch (char) {
        case 0:
        str += getRandomLetter(letter_case_array[getRandomNumberBetween(2,0)]);
        break;
        case 1:
        str += getRandomNumberBetween(10,0);
        break;
      }
    }
  }
  return str;
}

function getRandomNumberBetween(max,min){
  return Math.floor(Math.random()*(max-min)+min);
}

function getRandomLetter(letter_case) {
  if(letter_case=='caps'){
    return String.fromCharCode(getRandomNumberBetween(91,65));
  }else{
    return String.fromCharCode(getRandomNumberBetween(123,97));
  }
}
//common_functions.date_as_randomspan =  new Date().getTime();

module.exports = common_functions;
