const token =require('jsonwebtoken');
require("dotenv").config();
const generateToken = (id) => {
    return token.sign({id}, process.env.JWTSECRET, {
        expiresIn: '1d'
    });
}
module.exports = generateToken; 