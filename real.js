const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Payload } =require("dialogflow-fulfillment");
const app = express();

const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var randomstring = require("randomstring");
var user_name="";

app.post("/dialogflow", express.json(), (req, res) => {
    const agent = new WebhookClient({
                request: req, response: res
                });


async function identify_user(agent)
{
  const phn_num = agent.parameters.phn_num;
  const password = agent.parameters.password;
  console.log(password)
  const client = new MongoClient(url);
  await client.connect();
  const snap = await client.db("healthbot").collection("health_bot").findOne({phn_num: phn_num});

  if(snap==null){
          await agent.add("Re-Enter your phone number");

  }
  else
  {
  user_name=snap.username;
  await agent.add("Welcome  "+user_name+"!!  \n Do you want to book an appointment?");}
}

function report_issue(agent)
{

  var issue_vals={1:"Cardiaologist",2:"Neurologist",3:"ENT",4:"Dermatologist",5:"Physician"};

  const intent=agent.parameters.number;

    const time=agent.parameters.datetime.date_time;
    // const dat=agent.parameters.date;
    console.log(time);
    // console.log(dat);
    var time_date=time;

  var val=issue_vals[intent];

  var trouble_ticket=randomstring.generate(7);

  //Generating trouble ticket and storing it in Mongodb
  //Using random module
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("healthbot");

        var u_name = user_name;   
    var issue_val=  val;

        var myobj = { username:u_name, type:issue_val,time:time_date,token:trouble_ticket };

    dbo.collection("AppointmentDetails").insertOne(myobj, function(err, res) {
    if (err) throw err;
    db.close();   
  });
 });
 agent.add("Your appointment is booked : "+ val +"\nThe ticket number is: "+trouble_ticket);
}
async function identify_user(agent)
{
  const phn_num = agent.parameters.phn_num;
  const client = new MongoClient(url);
  await client.connect();
  const snap = await client.db("healthbot").collection("health_bot").findOne({phn_num: phn_num});

  if(snap==null){
          await agent.add("Re-Enter your phone number");

  }
  else
  {
  user_name=snap.username;
    usernameglobal=user_name;
  await agent.add("Welcome  "+user_name+"!!  \n Do you want to book an appointment?");}
}

function insurancecmp(agent)
{
    // agent.add("Enter Insurance Company name");
  
  const intent_val=agent.parameters.insurance;
    console.log(intent_val);
    console.log(usernameglobal);
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("healthbot");

        var myobj = { username:usernameglobal,insuranceCmp:intent_val };

    dbo.collection("userInsurance").insertOne(myobj, function(err, res) {
    if (err) throw err;
    db.close();   
  });
 });
agent.add("Press '1' for Cardiaologist \nPress '2' for Neurologist \nPress '3' for ENT \nPress '4' for Dermatologist \nPress '5' for Physician")
}
//trying to load rich response
async function report_issue1(agent)
{
 
  var issue_vals={1:"Cardiaologist",2:"Neurologist",3:"ENT",4:"Dermatologist",5:"Physician"};
  
//   const intent_val=agent.parameters.issue_num;

    const time=agent.parameters.datetime.date_time;
    console.log(time);
  const intent_val=agent.parameters.number;
  console.log(intent_val);
  //var company=agent.parameters.insurance;
  
  var val=issue_vals[intent_val];
  
  var trouble_ticket=randomstring.generate(7);

  //Generating trouble ticket and storing it in Mongodb
  //Using random module
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("healthbot");
    
	var u_name = user_name;    
    var issue_val=  val; 


	var myobj = { username:u_name, type:issue_val,time:time,token:trouble_ticket };

    dbo.collection("AppointmentDetails").insertOne(myobj, function(err, res) {
    if (err) throw err;
    db.close();    
  });
 });
if(intent_val>6 || intent_val<0)
 {
 await agent.add("Choose the correct number");
}
else{
  
  agent.add("Your appointment is confirmed: "+ issue_vals[intent_val] +"\nThe appointment number is: "+trouble_ticket+"\n");
}

}



var intentMap = new Map();
intentMap.set("Appointment", identify_user);
intentMap.set("Appointment-yes-custom", report_issue);
intentMap.set("Appointment-yes-custom-custom-number", report_issue1);
intentMap.set("Appointment-test-insurance-yes-yes-custom",insurancecmp);

agent.handleRequest(intentMap);

});//Closing tag of app.post

app.listen(process.env.PORT || 8080);