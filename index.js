const dotenv = require("dotenv");
dotenv.config();

const Connection = require('./database/connect.js');
Connection.connect();


const PORT = 3000;
const Express = require("express");
const app = Express();

app.use(Express.json());

app.listen(PORT, () => {
    console.log(`The Server is running on Port ${PORT}`);
});


const router = require('./routes/api.js');

app.use(router);