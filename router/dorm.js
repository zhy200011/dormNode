const body = require('body-parser'); //第三方插件将post请求转换为json

const express = require('express');
const app = express();
const mongoose = require('mongoose')
const mongodb = require('../mongo/mongo.js')
const Dorm = mongodb.Dorm
const User = mongodb.User
const router = express.Router()
app.use(body.urlencoded({
	extended: false
}));
app.use(body.json()); //可以使用request.body了,用req.body获取post过来的数据，用req.query获取get的数据 

function findAll(res, message) {
	Dorm.find().exec(function(err, ret) {
		res.send({
			code: 200,
			message: message,
			data: ret
		})
	})
}
router.get('/getAllDorm', function(req, res) { //获取所有宿舍
	// Dorm.deleteOne({'dormNum':'10-1-1'},function(err,ret){
	// 	console.log('删除')
	// });
	if(req.query.dormNum=="undefined"){
		Dorm.find().exec(function(err, ret) {
			res.json({
				code: 200,
				message: '查询成功',
				data: ret
			})
		})
	}else{
		Dorm.findOne({dormNum:req.query.dormNum}).exec(function(err, ret) {
			res.json({
				code: 200,
				message: '查询成功',
				data: ret
			})
		})
	}
});
router.post('/adDorm', function(req, res) { //新增宿舍
	let params = {
		dormNum:req.body.dormNum,
	};
	console.log(params)
	Dorm.findOne(params, function(err, ret) {
		if (ret == null) { //没有宿舍就创建
			Dorm.create(params, function(err, ret) {
				console.log('err'+err)
				if (err != null) {
					res.json({
						message: '创建失败',
						code: "200"
					})
				} else {
					findAll(res, '创建成功')
				}
			});
		} else { //有宿舍就返回已有
			res.json({
				'message': '已有宿舍'
			})
		}
	})
})
router.post('/deleteDorm', function(req, res) {
	let params = {
		dormNum: req.body.dormNum
	}
	console.log(params)
	Dorm.deleteOne(params, function(err, ret) {
		User.updateMany({'dorm.dormNum':req.body.dormNum}, {
			"dorm.dormNum": '','dorm.isRepaire':''
		}, function(err, ret) {
			if (err == null) {
				findAll(res, '删除成功');
			}
		})
	});

})
router.get('/changeIsRepaire', function(req, res) {
	let params = {
		dormNum: req.query.dormNum,
		isRepaire: req.query.isRepaire
	};
	Dorm.update({
		dormNum: params.dormNum
	}, {
		isRepaire: params.isRepaire
	}, function(err, ret) {
		// console.log(err)
		findAll(res, '更改维修状态成功')
	})
})
router.get('/changeRepaireType',function(req,res){
	let params ={
		dormNum:req.dormNum
	};
	Dorm.update(params,{repaireType:req.repaire},function(err,ret){
		if(err==null){
			findAll(res,'改变维修类型成功')
		}
	})
})
router.post('/changeDormRepaire',function(req,res){ //修改宿舍需要维修状态
	let params = {
		_id:req.body.id,
		dormNum:req.body.dormNum,
	};
	Dorm.update(params,{
		damageType:req.body.form.damageType,
		number:req.body.form.number,
		urgencyDegree:req.body.form.urgencyDegree,
		note:req.body.form.note,
	},
	(err,ret)=>{
		res.send(ret)
	}
	)
})

router.post('/search',(req,res)=>{ //查询符合条件的宿舍
if(req.body.isRepaire==''&&req.body.dormNum==''){
	findAll(res,'查询成功')
}else if(req.body.isRepaire==''&&req.body.dormNum!=''){
	Dorm.find({dormNum:req.body.dormNum},(err,ret)=>{
		res.json({message:'查询成功',data:ret,})
		
	})
}else{
	Dorm.find({$or:[
			{dormNum:req.body.dormNum},
			{isRepaire:req.body.isRepaire},],
		},(err,ret)=>{
		if(err==null){
			res.json(
			{message:'查询成功',data:ret,})
			
		}else{
			console.log(err)
		}
	})
}
	
})

router.post('/sureDormRepaire',(req,res)=>{//宿管确定宿舍已维修
	let params ={
		// _id:req.body.id,
		dormNum:req.body.dormNum,
		
	};
	Dorm.update(params,{note:'',
		repaireDate:req.body.date,
		number:'',
		urgencyDegree:'普通',
		damageType:[],
		isRepaire:false,
	},(err,ret)=>{
		if(err==null){
			User.update({"dorm.dormNum":req.body.dormNum},
			{"dorm.isRepaire":false},
			(err,ret)=>{
				if(err==null){
					Dorm.find({isRepaire:true}).exec((err,ret)=>{
						res.json({message:'确定维修成功',
						data:ret,
						code:200
						})
					})
				}
			}
			)
		}
	})
})

module.exports = router
