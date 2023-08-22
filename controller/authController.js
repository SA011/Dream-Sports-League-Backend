// const userDatabase = require('../database/users.js');
const bcrypt = require('bcryptjs');

function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}
function comparePassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
}

// module.exports.register = async (request, response) => {
//     const { userid, name, email, password} = request.body;
//     const added = await userDatabase.addUser(user, name, email, hashPassword(password));
//     if(added){
//         response.status(200).send("User added");
//     }else{
//         response.status(401).send("User already exists");
//     }
// }

// module.exports.login = async (request, response) => {
//     const { userid, email, password } = request.body;
//     const hashedPassword = await userDatabase.userPassword(userid, email);
//     if (hashedPassword == NULL) {
//         response.status(400).send("User not found");
//     } else if (!bcrypt.compareSync(password, hashedPassword)) {
//         response.status(200).send("User found");
//     }else{
//         response.status(401).send("Incorrect password");
//     }
// }

module.exports.register = async (request, response) => {
    response.status(200).send("User added");
}
module.exports.login = async (request, response) => {
    try{
        if(request.user.role != 'user'){
            request.logout((err) => {
                if(err){
                    console.log(err);
                }
            });
            response.status(401).send("Unauthorized");
        }else 
            response.status(200).send("User Logged In");
    }catch(err){
        console.log(err);
        response.status(400).send("Unauthorized");
    }
}

module.exports.logout = async (request, response) => {
    try{
        if(request.user == null){
            response.status(400).send("User not Logged in yet");
        }else{
            request.logout((err) => {
                if(err){
                    console.log(err);
                }
            });
            response.status(200).send("User logged out");
        }
    }catch(err){
        console.log(err);
        response.status(400).send("User not Logged in yet");
    }
};

module.exports.hashPassword = hashPassword;
module.exports.comparePassword = comparePassword;