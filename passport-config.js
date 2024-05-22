const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


function initialize(passport, getUserByEmail, getUserById) {

    //cannot find user. maybe change getuserbyemail function
    const authenticateUser = async (email, password, done) => {
        var user;
        try {
            user = await getUserByEmail(email)
            if(user == null){
                throw new Error("No user with that email.")
            }
        } catch (e) {
            return done(null, false, {message: 'No user with that email.'})
        }
        
        /*if (user == null) {
            return done(null, false, {message: 'No user with that email.'})
        }*/
        
        try {
           if(await bcrypt.compare(password, user.password)) {
                console.log("Signing jwt...")
                jwt.sign({email: user.email, id: user._id, firstNameame: user.firstName}, process.env.JWT_Secret, {}, (err, token) => {
                    if(err) throw err;
                    res.cookie('token', token).json(user)
                })
               return done(null, user)
           }
           else {
               return done(null, false, {message: 'Password incorrect'})
           }
        } catch (e) {
            return done(e);
        }
    }
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user,done) => done(null,user.id));
    passport.deserializeUser((id,done) => done(null, getUserById(id)))
}

module.exports = initialize;