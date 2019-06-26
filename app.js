// require('dotenv').config();

const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const User = require('./models/user');
const session = require('express-session');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const seeds = require('./seeds');
// const seedPosts = require('./seeds');
// seedPosts();

// require routes
const index = require('./routes/index');
const posts = require('./routes/posts');
const reviews = require('./routes/reviews');

const app = express();

// connect to the database
mongoose.connect('mongodb://localhost:27017/surf-shop', { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('we\'re connected!');
});

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// set public assets directory
app.use(express.static('public'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Configure Passport and Sessions
app.use(session({
    secret: 'plus ca change!',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});
// set local variables middleware
app.use(function(req, res, next) {
    req.user = {
        '_id': '5d06655f7eeee05d60c53cf0',
        'username': 'abg'
            // 'password': 'password'
    }, {
        '_id': '5d09028122ea42178ed0a405',
        'username': 'ken',
        'password': 'password'
    }, {
        '_id': '5d09029c22ea42178ed0a406',
        'username': 'nate',
        'password': 'password'
    }
    res.locals.currentUser = req.user;
    // set default page title
    res.locals.title = 'Surf Shop';
    // set success flash message
    res.locals.success = req.session.success || '';
    delete req.session.success;
    // set error flash message
    res.locals.error = req.session.error || '';
    delete req.session.error;
    // continue on to next function in middleware chain
    next();
});
// console.log('Mapbox token? ' + process.env.MAPBOX_TOKEN);
// seeds();
// Mount routes
app.use('/', index);
app.use('/posts', posts);
app.use('/posts/:id/reviews', reviews);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
    console.log(err);
    req.session.error = err.message;
    // res.redirect('back');
});
// app.listen(3002, function() {
//         console.log('connected on 3002')
//     })
module.exports = app;