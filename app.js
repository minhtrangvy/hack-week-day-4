var express = require('express');
var passport = require('passport'); //required
var FacebookStrategy = require('passport-facebook').Strategy //required
var graph = require('fbgraph');
var path = require('path');
var mongoose = require('mongoose');

//Connect to database
mongoose.connect('mongodb://localhost/photoapp');
var user_schema = mongoose.Schema({
    _id: Number,
    first_name: String,
    last_name: String,
    last_updated: Date,
    friends: [{
        id: String,
        name: String,
    }],
    posts: [{
        time: Date,
        sender_id: Number,
        sender_name:String,
        text: String,
    }],
    photos: [{
        url: String,
    }],
});

//user collection (where we store user docs in the database)
// interacts with the user_schema
var User = mongoose.model('User',user_schema);

// Retrieve a user from storage
function getUser(user_id, done) {
    User.findOne({ _id: user_id},
        function(err,user) {
            done(null, user); //null is error, user is data
        });
}

// Add a user to storage
function addUser(profile) {
 var user = new User ({
        _id: profile.id,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        last_updated: new Date(),
        friends: [],
        posts: [],
        photos: [],
    });

    user.save();
    return user;

}

// Add a post to a user's wall
function addPost(user, post) {
    User.update({ _id: user._id },
        { $push: {posts: post}},
        { $upsert: true},
        function(err,data){
            //do nothing
        });

}

// Add a photo to the user's profile
function addPhoto(user, photo) {
    User.update({ _id: user._id },
        { $push: {photos: photo}},
        { $upsert: true},
        function(err,data){
            //do nothing
        });
}

// Facebook app information
const FB_ID = '228372603994396';
const FB_APP_SECRET = '2c1f90d06c463e11f0ddfe4353c96a73';
const FB_CALLBACK_URL = 'http://localhost:3000/auth/facebook/callback';

// Necessary for saving users across sessions
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    getUser(id, function(err, user) {
        done(err, user);
    });
});

function updateFriends(user, accessToken) {
    graph.setAccessToken(accessToken);
    graph.get(user._id + '/friends?fields=id,name,installed', 
        function(err,res) {
            var friends = [];
            for (var i = 0; i < res.data.length; i++) {
                if (res.data[i].installed) {
                    friends.push(res.data[i]);
                }
            }
            User.update({ _id: user._id},
                        { $set: {friends:friends}},
                        { $upsert: true},
                        function(err,user){
                            //do nothing

                        }) //erases whatever's there
        });
}

passport.use(new FacebookStrategy({
    clientID: FB_ID,
    clientSecret: FB_APP_SECRET,
    callbackURL: FB_CALLBACK_URL,
    },
    function(accessToken, refreshToken, profile, done) {
        getUser(profile.id, function(err, user) {
            if (!user) {
                user = addUser(profile);
            }
            updateFriends(user, accessToken);
            return done(null, user);
        });
    }
));

var app = express();
app.configure(function() {
    // Use ejs as the view engine
    app.set('view engine', 'ejs');

    // Set up passport magic
    app.use(express.cookieParser());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.session({ 'secret': 'whisper' }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Indicate directory of static files
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);

});

// Authetication routes
app.get('/auth/facebook',
        passport.authenticate('facebook', { scope: ['user_friends', 'read_friendlists', 'user_status'] }),
        function(req, res) {
           // This is Facebook's job -- do nothing
        });

app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/' }));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// Site routes
app.get('/', function(req, res) {
    if (req.user) {
        res.render('index', {user: req.user});
    } else {
        res.render('index');
    }
});

app.get('/user/:id', function(req, res) {
    var id = parseInt(req.params.id);
    if (req.user) { //is someone logged in?
        if (req.user._id === id) { //if youre logged into the same
            //id as the profile that youre at
            // Render user profile
            res.render('profile', { user: req.user, posts: req.user.posts });
        } else {
            getUser(req.params.id, function(err, friend) {
                if (friend) { //if theyre youre friend,
                    //it's gonna show their profile
                    //if not, it wont show the profile
                    res.render('profile', { user: friend });
                } else {
                    res.status(404).send('Not found');
                }
            });
        }
    } else { //if not logged in, redirect
        res.redirect('/', 401);
    }
});

app.post('/user/:user_id/wallpost', function(req, res) {
    if (!req.user) {
        res.redirect('/', 401);
    } else {
        var post = {
            time: new Date(),
            sender_id: req.user._id,
            sender_name: req.user.first_name + ' ' + req.user.last_name,
            text: req.body['post']
        };
        addPost(req.user, post);
        res.redirect('/user/' + req.user._id);
    }
});

app.post('/user/:user_id/upload', function(req, res) {
    if (!req.user) {
        res.redirect('/', 401);
    } else {
        var photo = {
            url: req.body['url']
        };
        addPhoto(req.user, photo);
        res.redirect('/user/' + req.user._id);
    }
});

app.listen(3000);

/*
added mongo\bin to path
made a folder in db\data
mongod, open another terminal (order of these might be mixed up)
db.test.findOne() or ({name:'Trang'})
$push pushes whatever we give it onto 
db.test.update({thing}, push, upsert) - upsert updates this
and inserts back into the database again
$anything is what mongo is doing, not actually being stored
*/
