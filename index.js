const express = require('express')
const bodyParser= require('body-parser'); //第三方插件将post请求转换为json
const app = express()
const getAllStudents= require('./router/students')
const login = require('./router/login')
const getAllDorm = require('./router/dorm')
app.all("*",function(req,res,next){
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin","*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers","content-type");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.send(200);  //让options尝试请求快速结束
    else
        next();
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json()); //可以使用request.body了
app.use('/students', getAllStudents)
app.use('/users',login)
app.use('/dorm',getAllDorm)
//端口监听
app.listen(3000,(err)=> {
  if(!err) {
    console.log('服务器已启动')
  }
})
