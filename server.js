if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
  
//Importing libraries we installed using npm
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require("method-override")
const path = require('path')

const connection = require("./database");

app.use(express.static(path.join(__dirname, 'public')));

// Import initPassportLocal from passport-config
const initPassportLocal = require('./passport-config');
initPassportLocal();

app.set('view engine', 'ejs'); // Set EJS as the view engine, although no need as express automatically sets by observing extension

// Middleware setup
app.use(express.urlencoded({ extended: false })); //Parse incoming request bodies in URL-encoded format
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = {
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        }
        connection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [newUser.name, newUser.email, newUser.password], (error, results) => {
            if (error) {
                console.error("Failed to register user: ", error)
                return res.redirect('/register')
            } else {
                console.log("User registered successfully: ", results)
                res.redirect('/login')
            }
        })
    } catch (e) {
        console.log(e)
        res.redirect('/register')
    }
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    successFlash: true,
    failureFlash: true
}), (req, res, next) => {
    console.log("Login route reached."); // Log to see if the route is reached

    // If the execution reaches here, it means authentication failed
    console.log(req.flash("error")); // Log any error messages in flash

    // Redirect back to login page
    res.redirect('/login');
});
//End Routes

app.delete('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) {
            // Handle error
            console.error(err)
            return next(err)
        }
        // Redirect to some page after logout
        res.redirect('/')
    })
})


// app.post('/login', (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const query = 'SELECT * FROM users WHERE email = ?';
//         connection.query(query, [email], async (err, results) => {
//             if (err) {
//                 console.error('Error querying the database:', err);
//                 return res.status(500).redirect('/login');
//             } else {
//                 if (results.length > 0) {
//                     const user = results[0];
//                     const isPasswordMatch = await bcrypt.compare(password, user.password);
//                     if (isPasswordMatch) {
//                         console.log('Logged in successfully');
//                         return res.redirect('/');
//                     } else {
//                         console.log('Invalid username or password');
//                         return res.status(401).redirect('/login');
//                     }
//                 } else {
//                     console.log('User not found');
//                     return res.status(401).redirect('/login');
//                 }
//             }
//         })
//     } catch (e) {
//         console.error('Internal server error:', e);
//         console.log('Internal server error');
//         res.status(500).redirect('/login');
//     }
// })

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)  //use backticks to print 3000
})
