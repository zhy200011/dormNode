const mongoose =require('mongoose')
const config= require('../config/config.js')
const mongo=config.mongodb

mongoose.connect(mongo,{useNewUrlParser:true,useUnifiedTopology:true });
let obj ={
	dormNum:{type:'string',required:true},// 宿舍号码
	students:{type:'array',required:false,default:[]}, //住宿的学生，数组对象
	damageType:{type:'array',default:''}, //维修类型
	isRepaire:{type:'boolean',default:false},//是否维修
	note:{type:'string',default:'无'}, //维修备注
	urgencyDegree:{type:'string',default:'普通'},
	repaireDate:{type:'string',default:''}, //维修日期
	number:{type:'string',default:''}, //维修联系方式
	
}
exports.Dorm=mongoose.model('Dorm',obj)
exports.User= mongoose.model('User',{
	name:{type:'string',}, //学生姓名
	stuNum:{type:'string',required:true},//学号
	passWord:{type:'string',default:'password'}, //密码
	sex:{type:'string',default:'男'},//性别
	age:{type:'number',default:18}, //年龄
	dorm:{type:'object',required:false,default:{dormNum:'',isRepaire:false}}, //宿舍号 和是否正在维修 false代表没有维修
	isChange:{type:'boolean',default:false}, //是否改舍
	role:{type:'number',default:1} ,//权限设置,1 为学生，3 为管理员
	error:'',
	note:{type:'string',default:''}, //改舍备注
	wishDorm:{type:'string',default:''},
	number:{type:'string',default:''},//联系方式 改舍
	isSubChange:{type:'boolean',default:false},//改舍申请是否提交
	isSubRepaire:{type:'boolean',default:false},//维修申请是否提交
	isRepaire:{type:'boolean',default:false},//是否有维修申请
	
})



