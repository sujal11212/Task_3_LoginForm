const express=require("express")
const bcrypt=require('bcrypt')
const{MongoClient}=require("mongodb")
const session=require('express-session')
const bodyParser=require("body-parser")
const app=express()
const port=process.env.port|| 7000
const url="mongodb://127.0.0.1:27017"
const dbname="registration"
app.set("view engine","ejs")
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));
app.use(bodyParser.urlencoded({extended: false}))
async function create(req,res)
{
    const client=new MongoClient(url);
    try
    {
        await client.connect();
        const db=client.db(dbname);
        const collection=db.collection("signup");
        var u=req.body.name;
        var p=req.body.password;
        var c=req.body.cpass;
        var contact=req.body.phone;
        var email=req.body.email;
        var age=req.body.age;
        var b=0
        const r={name:u};
        const result=await collection.findOne(r);
        const a=parseInt(age);
        if(a<16)
        {
            res.send('<script>alert("User should be above 16 years");location.href=("http://localhost:7000/register");</script>')
        }
        else if(p!=c)
        {
            res.send('<script>alert("Password do not match");location.href=("http://localhost:7000/register");</script>')

        }
        else if(result)
        {
            res.send('<script>alert("User already exists");location.href=("http://localhost:7000/register");</script>')

        }
        
        else if(p.length>=8)
        {
                        const hashedPassword = await bcrypt.hash(p, 10);
                        const newUser={name:u,email:email,contact:contact,age:age,Password:hashedPassword}
                        const a=await collection.insertOne(newUser);
                        if (a)
                        {
                            res.render("thanku");
                        }
                        else
                        {
                            res.send("Error")
                        }
                
        } 
        else if(p.length<8)
        {
            res.send('<script>alert("Password must contain more then 8 characters");location.href=("http://localhost:7000/register");</script>')
        }
        
    }
    catch(err)
    {
        console.error(err);
    }
    finally
    {
        await client.close();
        console.log("Disconnected ");
    }
}
async function login(req,res)
{
    const client=new MongoClient(url);
    try
    {
        await client.connect();
        const db=client.db(dbname);
        const collection=db.collection("signup");
        var p=req.body.password;
        var email=req.body.email;
        var b=0
        const user = await collection.findOne({email:email});
        
        if(user  && await bcrypt.compare(p, user.Password))
        {
            res.send('Login Successfull !!!')

        }
        else{
            res.send('<script>alert("Invalid Credentials")</script>');
        }
    }
    catch(err)
    {
        console.error(err);
    }
    finally
    {
        await client.close();
        console.log("Disconnected ");
    }
}

app.post('/login',(req,res)=>
{
    login(req,res);
})
app.post('/l',(req,res)=>
{
    res.render("login");
})
app.get('/register',(req,res)=>
{
    res.render("registration");
})
app.post('/signup',(req,res)=>
{
    create(req,res);
})
app.get('/login',(req,res)=>
{
    res.render("login");
})
app.listen(port,() =>
{
    console.log(`App listening on port ${port}`)
})
