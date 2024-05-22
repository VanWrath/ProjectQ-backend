if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override')
const initializePassport = require('./passport-config');
const cookieParser = require("cookie-parser")

const app = express();

//const users = [];

//Models
var User = require('./model/user');

const { error } = require('console');

//Connect to DB
var db = mongoose.connect(
    process.env.DBURL,
    {
        dbName: 'Users'
    }
)

//Setup
initializePassport(passport, 
    async email => await User.findOne({email: email}),
    async id => await User.findOne({_id: id})
    )

app.all('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
	next();
})

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}))
app.use(cookieParser())
app.use(express.json())


//main page route
app.get('/', checkAuthenticated, async (req, res) => {
    var user = await req.user.then(data => {
        return data;
    });
    res.render('index.ejs', {firstName: user.firstName})
});

//login route
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
});


/*  Authenticate and login the user
*
*   Request body required fields:
*   email, password
*/
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

//register route
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
});

/*  registers new user
*
*   request body required fields:
*   firstName, lastName, email, password
*/
app.post('/register', checkNotAuthenticated, async (req, res) => {
    var user = new User()
    try {
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        user.password = hashedPassword;
        
        user.save();
        res.redirect('/login'); //redirect to login after successfully registering
    } catch {
        res.redirect('/register');
    }
    console.log("User created: " + user);
})

//logout the user
app.delete('/logout', (req,res,next) => {
    req.logOut((err) => {
        if(err) {
            return next(err);
        }
        res.redirect('/login')
    })
})

/*  Get user by email
*   Required params: 
*   email
*/
app.get('/user/email=:email', checkAuthenticated, findUserByEmail);



/*  Get user by id
*   Required params: 
*   id
*/
app.get('/user/id=:id', checkAuthenticated, findUserById);

/*  Get answers for specific user
*   required params:
*   id
*/
app.get('/user/:id/answers', checkAuthenticated, (req, res) => {

})

/*  PUT answers for specified user
*   Required params:
*   id
*
*   Request body required fields
*   question, answer
*
*   returns updated user data.
*/
app.post('/user/:id/answer', checkAuthenticated, async (req, res) => {
    const { id } = req.params;
    var newAnswer = {
        date: Date.now(),
        question: req.body.question,
        answer: req.body.answer
    }
    console.log("New Answer: " + JSON.stringify(newAnswer));
    await User.findByIdAndUpdate(id, {$push: {journal: newAnswer}}) 
    const updatedUser = await User.findById(id)
    return res.status(200).json(updatedUser);
})

/*  PUT answers for specified user
*   Required params:
*   id
*
*   Request body required fields
*   question, answer
*/
app.put('/user/:id', checkAuthenticated, (req, res) => {
    console.log('updating user...')
    console.log(req.params.id);
    console.log(JSON.stringify(req.body));
    const id = req.params.id;
    const newAnswer = {
        date: Date.now(),
        question: req.body.question,
        answer: req.body.answer
    }

    User.updateOne({_id: id}, {$push: newAnswer})
})


function checkAuthenticated(req,res,next){
    if (req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req,res,next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

async function findUserById(req, res, next) {
    console.log('fetching user by id: ' + req.params.id)
    try {
        const user = await User.findById(req.params.id)
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

async function findUserByEmail(req, res, next) {
    console.log('fetching user by email: ' + req.params.email)
    try {
        const user = await User.find({email: req.params.email})
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

app.listen(3000, () => console.log('listening on port 3000'));
