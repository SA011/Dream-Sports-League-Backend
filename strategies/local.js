const { Strategy } = require('passport-local');
const userDatabase = require('../database/users.js');
const authController = require('../controller/authController');
const  passport = require('passport');

passport.serializeUser((user, done) => {
    // console.log(user);
    try{
        done(null, user.user_id);
    }catch(error){
        done(error, null);
    }

});

passport.deserializeUser(async (user_id, done) => {
    // console.log(user_id)
    try {
        const user = await userDatabase.getUser(user_id);
        if(user == null){
            // console.log('user not found');
            throw new Error('Unauthorized');
        }
        done(null, user);
    }catch(error){
        done(error, null);
    }
});

passport.use(new Strategy(
    {
        usernameField: 'user_id',
    },
    async (user_id, password, done) => {
        try {
            const user = await userDatabase.getUser(user_id);
            if(user == null){
                // console.log('user not found');
                done(null, null);
            }else if(authController.comparePassword(password, user.password)){
                done(null, user);
            }else{
                // console.log('incorrect password');
                done(null, null);
            }
        }catch(error){
            // console.log(error);
            done(error, null);
        }
    }
));
        

passport.use('local-register', new Strategy(
    {
        usernameField: 'user_id',
        passwordField: 'password',
        passReqToCallback: true,
    },
    async (request, user_id, password, done) => {
        try {
            const user = await userDatabase.createUser(user_id, request.body.name, request.body.email, request.body.team_name, request.body.favorite_team, authController.hashPassword(password));
            done(null, user);
        }catch(error){
            done(error, null);
        }
    }
));