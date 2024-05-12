const passport = require("passport");
const passportLocal = require("passport-local");
const getUser = require("./getUser");

const LocalStrategy = passportLocal.Strategy;

let initPassportLocal = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, email, password, done) => {
        console.log("Passport local strategy executed."); // Log to see if strategy is executed
    
        try {
            let user = await getUser.findUserByEmail(email);
            console.log("User found:", user); // Log user object if found
    
            if (!user) {
                console.log("User not found."); // Log if user is not found
                return done(null, false, req.flash("error", `User with email "${email}" not found`));
            }
    
            let match = await getUser.comparePasswordUser(user, password);
            console.log("Password match:", match); // Log if password matches
    
            if (match) {
                return done(null, user);
            } else {
                console.log("Password incorrect."); // Log if password is incorrect
                return done(null, false, req.flash("error", "Incorrect password"));
            }
        } catch (err) {
            console.log("Error:", err); // Log any errors that occur
            return done(err);
        }
    }));    
};

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    getUser.findUserById(id).then((user) => {
        return done(null, user);
    }).catch(error => {
        return done(error, null);
    });
});

module.exports = initPassportLocal;