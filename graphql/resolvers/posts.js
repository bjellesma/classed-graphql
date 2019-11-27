const {AuthenticationError} = require('apollo-server')
const Posts = require('../../models/Posts')
const checkAuth = require('../../util/check_auth')

module.exports = {
    Query: {
        async getPosts(){
            // Posts is refering to our imported model
            try{
                const posts = await Posts.find().sort({createdAt: -1})
                return posts;
            }catch(err){
                throw new Error(err)
            }
        },
        async getPost(_, {postId}){
            try{
                const post = await Posts.findById(postId);
                //if there is a post returned, return the post, else, throw an error
                if(post){
                    return post
                } else {
                    throw new Error('Post not found')
                }
            }catch(err){
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async createPost(_, {body}, context){
            //check the user by using check auth to see if there's a valid auth token
            const user = checkAuth(context)

            const newPost = new Posts({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })

            const post = await newPost.save()

            return post;
        },
        async deletePost(_, {postId}, context){
            const user = checkAuth(context)

            try{
                const post = await Posts.findById(postId)
                if(user.username === post.username){
                    await post.delete()
                    return 'Post deleted successfully'
                }else{
                    throw new AuthenticationError('Not allowed to delete a post that you don\'t own')
                }
            //we're just throwing a generic error because the auth error defined in the try statement will bubble to the top
            }catch(err){
                throw new Error(err)
            }
        }
    }
}