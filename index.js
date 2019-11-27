const {ApolloServer} = require('apollo-server')
const gql = require('graphql-tag')
const mongoose = require('mongoose')


const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
const {MONGODB} = require('./config')



//init the server with the graphql types and resolvers
const server = new ApolloServer({
    typeDefs,
    resolvers,
    //we want to take in a context object to get access to the headers
    context: ({ req }) => ({ req })
})

//connect to database and then start server
mongoose.connect(MONGODB, { useNewUrlParser: true}).then(() => {
    //start server
    //uses express like syntax
    console.log('Mongo connected')
    return server.listen({
        port: 5000
    })
}).then(res => {
    console.log(`Server running at ${res.url}`)
})

