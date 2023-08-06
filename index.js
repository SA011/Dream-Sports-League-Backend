const dotenv = require("dotenv");
const Express = require("express");
const Connection = require('./database/connect.js');
const router = require('./routes/api.js');
const cors = require('cors');

const PORT = 8080;
const app = Express();

dotenv.config();
Connection.connect();

app.use(cors());
app.use(Express.json());
app.use('/api',router);

app.listen(PORT, () => {
    console.log(`The Server is running on Port ${PORT}`);
});

