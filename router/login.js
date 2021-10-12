
const body= require('body-parser'); //第三方插件将post请求转换为json

const express = require('express');
const app = express();
const mongoose= require('mongoose')
const mongodb= require('../mongo/mongo.js')
const Dorm =mongodb.Dorm
const User =mongodb.User
const router=express.Router()
app.use(body.urlencoded({extended:false}));
app.use(body.json()); //可以使用request.body了,用req.body获取post过来的数据，用req.query获取get的数据 
router.post('/login',function(req,res){ //登录接口
	let obj={
		stuNum:req.body.stuNum,//账号
		passWord:req.body.passWord //密码
		
	}
	User.findOne(obj).exec(function(err,ret){
		// console.log(ret)
		if(ret==null){
			res.send({message:'账号密码不匹配'})
		}else{
			res.send({code:'200',role:ret.role,name:ret.name})
		}
		// let reqPassword= req.query.password
		// let retPass= ret.password
		// if( reqPassword==retPass ){
		// 	res.send({code:'200'})
		// }else{
		// 	res.send('err')
		// }
		// console.log(ret.password)
		// res.json({code:'200'})
		
		
	})
})
module.exports=router