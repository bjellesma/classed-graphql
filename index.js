const {ApolloServer} = require('apollo-server')
const gql = require('graphql-tag')
const mongoose = require('mongoose')

const Posts = require('./models/Posts')
const User = require('./models/User')
const {MONGODB} = require('./config')

const typeDefs = gql`
    type Post{
        id: ID!
        body: String!
        createdAt: String!
        username: String!
    }
    type Query{
        getPosts: [
            Post
        ]
    }
`

const resolvers = {
    Query: {
        async getPosts(){
            // Posts is refering to our imported model
            try{
                const posts = await Posts.find()
                return posts;
            }catch(err){
                throw new Error(err)
            }
        }
    }
}

//init the server with the graphql types and resolvers
const server = new ApolloServer({
    typeDefs,
    resolvers
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

