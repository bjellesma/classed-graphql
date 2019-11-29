const {gql} = require('apollo-server')
module.exports = gql`
# the ! means that it's a required field
    type Post{
        id: ID!
        body: String!
        createdAt: String!
        username: String!
        comments: [Comment!]!
        likes: [Like]!
        likeCount: Int 
        commentCount: Int 
    }
    type Comment{
        id: ID!
        createdAt: String!
        username: String!
        body: String!
    }
    type Like{
        id: ID!
        createdAt: String!
        username: String!
    }
    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
    }
    # to define a mutation, you need an input
    input RegisterInput{
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }
    type Query{
        getPosts: [
            Post
        ]
        getPost(postId: ID!): Post
    }
    # mutations are the functions of graphql
    type Mutation{
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!): User!
        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        createComment(postId: String!, body: String!): Post!
        deleteComment(postId: String!, commentId: String!): Post!
        # Our plan is make the like button a toggle field so we don't need an unlike button
        # we don't need a way to delete likes
        likePost(postId: ID!): Post!
    }
    # subscriptions are generally used for polling
    # if this case, we're creating a subscription so that each time a new post is made, it will notify everyone
    type Subscription{
        newPost: Post!
    }
`