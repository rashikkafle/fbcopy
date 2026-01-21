require('dotenv').config();  // load .env variables
const express = require('express')
const app = express()
const usermodel = require('./models/user')
const postmodel = require('./models/post')
const jwt =require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookieparser = require('cookie-parser')
const upload = require('./multer')
const user = require('./models/user')
const mongoose =require('mongoose')

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieparser())
app.use(express.static('public'))

app.set('view engine','ejs')

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch(err => console.log("❌ MongoDB connection error:", err));




app.get('/',(req,res)=>{ 
    res.render('index')
})

app.get('/create', async(req,res)=>{
    res.redirect('/')
     const users = await usermodel.findOne({username})
    if(username === users.username)return res.status(400).send('username already exist')
})

app.post('/create', async(req,res)=>{
    const {username ,email,password} = req.body

        
    const salt =await  bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password,salt)
    const user = await usermodel.create({
        username,
        password : hash,
        email
    })
       

    const token =  jwt.sign({username, userid: user._id},process.env.JWT_SECRET)
    res.cookie('token',token)

    
    res.redirect('/profile')
}) 

app.get('/login',  (req,res)=>{
    res.render('login')
})

app.post('/login',async (req,res)=>{
    const {username,password}= req.body
    const user = await usermodel.findOne({username})
     const token =  jwt.sign({username, userid: user._id},process.env.JWT_SECRET)
    res.cookie('token',token)

  let match = await bcrypt.compare(password,user.password)
  if(!match) return res.send('wrong username or password')
 console.log(user.username)
res.redirect('/profile')
})

app.get('/logout',(req,res)=>{
    res.cookie('token','')
    res.redirect('/')
})

app.get('/deleteall',async(req,res)=>{
    await usermodel.deleteMany({})
    res.redirect('/')
})

function isloggedin (req,res,next){
    
    if(!req.cookies.token) return res.status(401).send('login first')
        const data = jwt.verify(req.cookies.token,process.env.JWT_SECRET)

        req.user= data
        next()
}


app.post('/post',isloggedin, upload.single('photo'), async(req,res)=>{

       const {review } = req.body

   const user = await usermodel.findOne({username: req.user.username})
  const posts=  await postmodel.create({
    review,
    
    user: user._id
})
posts.photo = req.file.filename


user.post.push(posts._id)
await posts.save()
await user.save()

res.redirect('/profile')
})

app.get('/profile',isloggedin,async(req,res)=>{

const user = await usermodel.findOne({username :req.user.username}).populate("post")
 const posts =await postmodel.find().populate("user")
const ab =req.user.username

 if(!posts) return res.send('err')
 

res.render('profile', {posts,user,ab})
})

app.post('/upload',isloggedin, upload.single('profilepic'), async(req,res)=>{

   const user = await usermodel.findOne({username: req.user.username})
  

user.profilepic = req.file.filename
 
await user.save()

res.redirect('/profile')
})

app.get('/search',async(req,res)=>{

    const query = req.query.q
    const usersk = await usermodel.find({
        username : { $regex : query, $options:'i'}
    })
    res.render('search',{usersk})
})

app.get('/user/:id',async(req,res)=>{

    const user = await usermodel.findById(req.params.id)

    const post = await postmodel.find({
        user : user._id
    }).populate('user')
    
     res.render('userposts',{user, post})
})

app.get('/delete/:id',async(req,res)=>{
    const post =await postmodel.findOneAndDelete({ _id : req.params.id})
    res.redirect('/profile')
})
app.listen(3000)