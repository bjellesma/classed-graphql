const {AuthenticationError} = require('apollo-server')
const jwt = require('jsonwebtoken')
const {SECRET_KEY} = require('../config')

module.exports = (context) => {
    //get the authorization http header
    const authHeader = context.req.headers.authorization
    if(authHeader){
        //because this is a bearer token, we will want to split the string at the bearer word
        const token = authHeader.split('Bearer ')[1]
        if(token){
            try{
                const user = jwt.verify(token, SECRET_KEY)
                return user;
            }catch(err){
                throw new AuthenticationError('Invalid/Expired token')
            }
        }
        throw new Error('Auth token invalid. String must be Bearer [token]')
    }
    throw new Error('Auth token not added')
}