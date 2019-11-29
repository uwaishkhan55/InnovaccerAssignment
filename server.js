const express = require('express')
const app = express()
const {Host,Visitor,db}=require('./db')
app.use(express.json())
var cookieParser = require('cookie-parser');
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))
var nodemailer  = require('nodemailer');
var date = new Date();
//sending message to hostnpm i 
const accountSid = 'AC74e82410895a9bce6d1692560856ea88';
const authToken = 'API_key';
const client = require('twilio')(accountSid, authToken);
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mohdravil001@gmail.com',
    pass: 'mohdravil123@'
  }
});
app.post('/database',async(req,res)=>{
    
    let item1 = await Host.create(
        {
             Name:req.body.hname,
             Email:req.body.hemail,
             Number:req.body.hnumber,
             Address:req.body.address,
        }
      )
     
    let item =await Visitor.create({
        Name:req.body.vname,
        Email:req.body.vemail,
        Number:req.body.vnumber,
        HostId:item1.id,
        CheckIn:date.toLocaleString()
      
    })
let name=item.Name;
let email=item.Email;
let number=item.Number;
let hnumber=item1.Number
let checkIn=item.CheckIn;
let id=item.id;
res.cookie('id',id,{maxAge: 7*24*60*60*1000}); 
console.log(name);
console.log(email);
console.log(hnumber)

//Sending message to the Host With the Visitor details.

client.messages
  .create({
     body: `Name - ${name}\nEmail - ${email}\nPhone - ${number}\nCheckin Time - ${checkIn}`,
     from: '+12408927209',
     to: '+917007936908'
   })
  .then(message => console.log(message.sid));
 
//Sending Email to Host
var mailOptions = {
  from: 'uwaishkhan55@gmail.com',
  to: item1.Email,
  subject: 'Visit Status',
  text: `Name - ${name}\nEmail - ${email}\nPhone- ${number}\nCheckin Time- ${checkIn}`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
   
     res.redirect('/WaitingPage.html')
})


app.get('/end',async(req,res)=>{
    console.log(req.cookies.id+"hi")
    let id=req.cookies.id;
    let item =await Visitor.findOne({
        include:[{
            model:Host
        }],
        where:{
           id:id
        }
    })
     
 
   date=new Date()
   var d=date.toLocaleString()
   Visitor.update(
    {CheckOut:d},
    {
        where:{
            id:id
        }
    }
)
//Sending Email to Visitor
var mailOptions = {
    from: 'uwaishkhan55@gmail.com',
    to: item.Email,
    subject: 'Visit Status',
    text: `Name - ${item.Name}\nPhone - ${item.Number}\nCheckin Time - ${item.CheckIn}\nCheckout Time - ${ d}\nName - ${item.Host.Name}\nAddress - ${item.Host.Address}`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
     
   //sending response to user 
    res.sendStatus(200)

})
let Port =process.env.PORT||3000;
app.listen(Port,()=>{
    console.log(Port)
})