const express = require('express');
const mongoose= require('mongoose')
const mongodb= require('../mongo/mongo.js')

const Dorm =mongodb.Dorm
const User =mongodb.User
const router=express.Router()
// let user = {
// 	name:'admin',
// 	stuNum:'1000',
// 	dorm:{
// 		// dormNum: '10-1-1',
// 		isRepaire:false,
// 	},
	
// 	role:3,
// }
// var users = new User(user)
// users.save()
// let students ={
// 	students:[
// 		{name:'朗讯',stunum:'19830'},
		
// 	], //插入数组对象
// 	dormNum:'10-1-1', //寝室号
// 	}
// var dorm = new Dorm(students)
// dorm.save();
function findAll(res,message){
	User.find().exec(function(err,ret){ //返回所有数据
		res.json({
			code:200,
			message:message,
			data:{
				name:ret.name,
				stuNum:ret.stuNum,
				sex:ret.sex,
				age:ret.age,
				dorm:ret.dorm,
				wishDorm:ret.wishDorm,
				isChange:ret.isChange,
				role:ret.role,
				error:ret.error,
				note:ret.note,
				number:ret.number
			}
		})
	})
}
router.get('/getAllStudents',(req,res) => { //获取一个或多个数据
	// User.deleteMany({'name':'zhy'},function(err,ret){
	// 	console.log('ss')
	// })
	// findAll(res,'查询成功');
	let params;
	if(req.query.stuNum=='undefined'||req.query.stuNum==1000){
		User.find().exec(function(err,ret){
			res.json({data:ret,code:200,message:'全部数据'})
			})
	}else if(req.query.stuNum){
		params={stuNum:req.query.stuNum};
		User.find(params).exec(function(err,ret){
			res.json({data:ret,code:200,message:'查询成功'})
		})
	}
	
});
router.post('/addStudents',(req,res) =>{ //增加学生接口
		let params={
			name:req.body.name, //姓名
			stuNum:req.body.stuNum, //学号
			sex:req.body.sex,
			age:req.body.age,
			dormNum:req.body.dormNum, //宿舍号
			number:req.body.number, //邮箱
		}
		if(req.body.dormNum){ //更新宿舍
			Dorm.findOne({dormNum:params.dormNum}).exec((err,ret)=>{
				let arr=JSON.parse(JSON.stringify(ret));
				// console.log(arr)
				if( arr!=null&&arr.students.length>=6){
					res.send({message:'宿舍已满'})
					return;
				}else{
					Dorm.update(
					{
						dormNum:params.dormNum,
					},
					
					{"$addToSet":{students:{name:params.name,stuNum:params.stuNum}}},
					function(err,ret){
						// console.log(err +'err')
						if(err!=null){
							res.send({message:'更新宿舍失败'})
							return;
						}else{
							params.isRepaire=ret.isRepaire;
							User.find({stuNum:params.stuNum,}).exec((err,ret)=>{
								
								if(ret.length==0){
									User.create({
										name:params.name,
										stuNum:params.stuNum,
										sex:params.sex,
										"dorm.dormNum":params.dormNum,
										"drom.isRepaire":params.isRepaire,
										number:params.number,
										age:params.age
										
									},function(err,ret){ //添加学生
										if(!err){
											findAll(res,'新增成功');
										}else{
											res.json(err)
										}
									})
								}else{
									res.send({message:'学号重复'})
								}
							})
						
						}
					})
					
				}
			})
		}else{
			User.find({stuNum:params.stuNum,}).exec((err,ret)=>{
				
				if(ret.length==0){
					User.create({
						name:params.name,
						stuNum:params.stuNum,
						sex:params.sex,
						"dorm.dormNum":params.dormNum,
						"drom.isRepaire":params.isRepaire,
						number:params.number,
						age:params.age
						
					},function(err,ret){ //添加学生
						if(!err){
							findAll(res,'新增成功');
						}else{
							res.json(err)
						}
					})
				}else{
					res.send({message:'学号重复'})
				}
			})
		}
		
		
	
});

router.get('/upDateChange',(req,res) =>{
	let params={
		name:req.query.name,
		stuNum:req.query.stuNum
	};
	User.findOneAndUpdate(params,{isChange:req.query.isChange},function(err,ret){
		if(!err){
			findAll(res,'修改维修状态成功');
		}
	})
})

router.post('/search',(req,res)=>{
	let params=[
		{"name":req.body.name },
		{'stuNum':req.body.stuNum},
		{'dorm.dormNum':req.body.dormNum},
		{'sex':req.body.sex},
		{'dorm.isRepaire':req.body.isRepaire}
	];
	User.find({"$or":params}).exec((err,ret)=>{
		ret.map(item=>{
				let arr= item
				// arr.name= item.name.replace(/[',//]/g,'');
				// arr.dorm.dormNum=item.dorm.dormNum.replace(/[',//]/g,'');
				return arr
			})
			res.json({data:ret,code:200,message:'查询成功'})
		})
	
})

router.post('/applyChangeDorm',(req,res) => { //申请更改宿舍
	let params ={
		name:req.body.name,
		stuNum:req.body.stuNum,
		sex:req.body.sex,
		note:req.body.note,
		wishDorm:req.body.wishDorm,
		number:req.body.number,
		id:req.body.id,
	};
	User.update({
		_id:params.id,
		name:params.name,
		stuNum:params.stuNum,
		
	},{
		wishDorm:params.wishDorm,
		note:params.note,
		number:params.number,
		isChange:true,
	},function(err,ret){
		if(ret!=null){
			User.find().exec(function(err,ret){
				res.json(ret)
			})
		}
		
	}) 
 })
 router.post('/retractApplyChange',(req,res) =>{ //撤回申请
 	 let params ={
 	 	name:req.body.name,
 	 	stuNum:req.body.stuNum,
		_id:req.body.id
 	 };
	 User.update(params,{
	 	isChange:false,
	 },function(err,ret){
	 	if(ret!=null){
	 		User.find().exec(function(err,ret){
	 			res.json(ret)
	 		})
	 	}
	 	
	 }) 
})	 

router.post('/applyRepaire',(req,res)=>{ //维修申请
	let params = {
		name:req.body.name,
		stuNum:req.body.stuNum,
		form:req.body.form,
		repaireDate:req.body.date,
		isRepaire:req.body.isRepaire,
		id:req.body.id
	};
	User.update({
		_id:params.id,
		name:params.name,
		stuNum:params.stuNum,},
		{$set:{"isRepaire":true}},
		function(err,ret){
			if(ret){
				User.findOne({
					_id:params.id,
					name:params.name,
					stuNum:params.stuNum
				}).exec((err,ret)=>{
					let dormNum=ret.dorm.dormNum;
					if(err){
						res.send('服务器错误');
					}else{
						Dorm.update(
						{dormNum:dormNum},
						{
							isRepaire:true,
							damageType:params.form.damageType,
							urgencyDegree:params.form.urgencyDegree,
							note:params.form.note,
							repaireDate:params.repaireDate,
							number:params.form.number,
						},
						function(err,ret){
							if(ret.n==0){
								res.send({message:'提交失败'})
							}else{
								res.send({message:'提交成功'})
							}
						})
					}
					
				})
			}
		})
	
});

router.post('/subApplyRepaire',(req,res)=>{ //提交维修申请
	let params ={
		stuNum:req.body.stuNum,
		dormNum:req.body.dormNum
	}
	
	User.update({stuNum:params.stuNum},{isSubRepaire:true,"isRepaire":false},(err,ret)=>{
		Dorm.update({dormNum:params.dormNum},{isRepaire:true},(err,ret)=>{
			if(err==null){
				res.json({message:'提交申请成功'})
			}
		})
	})
})


router.post('/retractApllyRepaire',(req,res)=>{ //撤销维修申请
	let params = { 
		_id:req.body.id,
		name:req.body.name,
		stuNum:req.body.stuNum
	};
	User.update(params,{$set:{"isRepaire":false}},function(err,ret){
		if(ret.n!=0){
			User.findOne(params).exec(function(err,ret){
				// console.log(ret)
				Dorm.update({dormNum:ret.dorm.dormNum},{
					damageType:'',
					isRepaire:false,
					urgencyDegree:'普通',
					note:''
				}).exec(function(err,ret){
					
					res.send({message:'撤回成功'})
				})
			})
		}
	})
})

router.post('/subChange',(req,res)=>{ //改变是否申请改舍提交
	let params={
		name:req.body.name,
		stuNum:req.body.stuNum,
		_id:req.body.id
	};
	User.update(params,{isSubChange:true,isChange:false},(err,ret)=>{
		res.send({message:'提交成功'})
	}
		
	)
	
})

router.post('/assignmentDorm',(req,res)=>{ //分配宿舍
	let params =req.body
	User.update({_id:params.id,name:params.name,stuNum:params.stuNum},{$set:{'dorm.dormNum':params.dormNum}},
	function(err,ret){});
	Dorm.findOne({dormNum:params.dormNum}).exec((err,ret)=>{
		if(ret!=null){
			if(ret.students.length<6){
				Dorm.update({dormNum:params.dormNum},{$push:{students:{stuNum:params.stuNum,name:params.name}}}).exec((err,ret)=>{
					res.send({message:'添加成功'})
				})
			}else{
				res.send({message:'宿舍已满'})
			}
		}else{
			res.send({message:'无此宿舍'})
		}
	})
})

router.post('/deleteStudents',(req,res)=>{ //删除学生
	let params ={
		stuNum:req.body.stuNum
	};
	User.findOne(params,function(err,ret){
		if(ret!=null){
			Dorm.update({dormNum:ret.dorm.dormNum,},{$pull:{students:{stuNum:params.stuNum}}},(err,rett)=>{
				User.deleteOne(params).exec((err,ret)=>{
					res.json({message:'删除成功'})
				})
			})
		}
		
		
		
	})
	
})

router.post('/manageChange',(req,res)=>{ //处理改舍申请
	let params={
		name:req.body.name,
		_id:req.body._id,
		stuNum:req.body.stuNum
	};
	let stateManage=req.body.stateManage;//处理状态，true同意，false拒绝
	if(stateManage){
		User.updateOne(params,{isSubChange:false,dorm:{dormNum:req.body.wishDorm},note:'',wishDorm:'',isChange:false},(err,ret)=>{
			if(err==null){
				Dorm.updateOne({dormNum:req.body.dorm.dormNum},{$pull:{"students":{"stuNum":req.body.stuNum}}}).exec((err,ret)=>{
					console.log(req)
					Dorm.update({dormNum:req.body.wishDorm},{$push:{students:{stuNum:req.body.stuNum,name:req.body.name}}},(err,ret)=>{//修改期望宿舍
						res.json({message:'接受申请'})
					})
				})//修改原本宿舍数据
			
			}
		})
	}else{
		User.update(params,{isChange:false,isSubChange:false,note:'已被拒绝',wishDorm:''}).exec((err,ret)=>{
			res.json({message:'拒绝成功'})
		})
	}
})

module.exports=router