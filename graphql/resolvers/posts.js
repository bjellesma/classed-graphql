const {AuthenticationError,UserInputError} = require('apollo-server')
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

            //create a new subscription to be pushed out
            context.pubsub.publish('NEW_POST', {
                newPost: post
            })

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
        },
        async likePost(_, {postId}, context){
            const {username} = checkAuth(context);

            const post = await Posts.findById(postId)
            if(post){
                //if the like given belongs to the user
                //if the post is liked, unlike it
                if(post.likes.find(like => like.username === username)){

                    //splice off the like that is ours
                    // post.likes = post.likes.filter(like => like.username !== username)
                    const likeIndex = post.likes.findIndex(like => like.username === username)
                    post.likes.splice(likeIndex, 1)
                    await post.save()
                }else{
                    //add a like onto the post
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }

                await post.save()
                return post
            }
            else{
                throw new UserInputError('Post not found')
            } 
        }
    },
    Subscription: {
        newPost: {
            //pubsub is the third arg because it belongs to the context object
            subscribe: (_, __, {pubsub}) => pubsub.asyncIterator('NEW_POST')
        }
    }
}