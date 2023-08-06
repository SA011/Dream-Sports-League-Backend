const dotenv = require("dotenv");
dotenv.config();

const Connection = require('./database/connect.js');
Connection.connect();


const PORT = 8080;
const Express = require("express");
const app = Express();
var cors = require('cors');
app.use(cors());

app.use(Express.json());

app.listen(PORT, () => {
    console.log(`The Server is running on Port ${PORT}`);
});


const router = require('./routes/api.js');

app.use('/api',router);