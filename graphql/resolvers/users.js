
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {UserInputError} = require('apollo-server')

//we need array destructuring if this is not the default export
const {validateRegisterInput,validateLoginInput} = require('../../util/validators')
const {SECRET_KEY} = require('../../config')
const User = require('../../models/User')

//helper function to generate jwt
function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, {expiresIn: '1h'} )
}
module.exports = {
    Mutation: {
        async login(_, {username, password}){
            const {errors, valid} = validateLoginInput(username, password)
            

            //if validation fails
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }

            const user = await User.findOne({username})

            if(!user){
                errors.general = 'User not found'
                throw new UserInputError('Wrong cred', {errors})
            }

            // hash the enterred password and compare it to what is in the database
            const match = await bcrypt.compare(password, user.password)
            if(!match){
                errors.general = 'Wrong cred'
                throw new UserInputError('Wrong cred', {errors})
            }

            const token = generateToken(user)

            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
        //parent refers to the parent resolver
        //args refers to the inputs on the resolver (in this case, we are destructuring registerInput according to its definition in typeDefs)

        //info is just unneeded metadata
        async register(parent, {registerInput: {username, email, password, confirmPassword}}, context, info){
            //validate user data
            const {valid, errors} = validateRegisterInput(username, email, password, confirmPassword)
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }
            //make sure user doesn't exist
            //the await is important because an error will be thrown if await is not used
            const user_find = await User.findOne({username});
            if(user_find){
                throw new UserInputError('Username is taken', {
                    //the errors object will be used later on the frontend for form validation
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }
            //hash password
            //12 is just a good number for our hashing function
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            })

            const user = await newUser.save()

            //create auth token
            const token = generateToken(user)

            return {
                ...user._doc,
                id: user._id,
                token
            }
            
        }
    }
}