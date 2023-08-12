const dotenv = require("dotenv");
const Express = require("express");
const passport = require('passport');
const session = require('express-session');

const Connection = require('./database/connect.js');
const router = require('./routes/api.js');
const cors = require('cors');

const PORT = 8080;
const app = Express();

dotenv.config();
Connection.connect();

require('./strategies/local.js')


app.use(cors());
app.use(Express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api',router);



app.listen(PORT, () => {
    console.log(`The Server is running on Port ${PORT}`);
});

