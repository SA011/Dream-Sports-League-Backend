const dotenv = require("dotenv");
const Express = require("express");
const passport = require('passport');
const session = require('express-session');



dotenv.config();

const Connection = require('./database/connect.js');
const router = require('./routes/api.js');
const cors = require('cors');

const PORT = process.env.PORT || 8080;
const app = Express();

// Connection.connect();

require('./strategies/local.js')


app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use(Express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api',router);



app.listen(PORT, () => {
    console.log(`The Server is running on Port ${PORT}`);
});

