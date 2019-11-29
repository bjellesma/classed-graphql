

const {AuthenticationError,UserInputError} = require('apollo-server')

const Posts = require('../../models/Posts')
const checkAuth = require('../../util/check_auth')

module.exports = {
    Mutation: {
        // equivalent to async function createComment(_, {postId, body}, context)
        createComment: async (_, {postId, body}, context) => {
            const {username} = checkAuth(context);

            //if the body of the comment is empty
            if(body.trim() === ''){
                throw new UserInputError('A comment must be entered', {
                    errors: {
                        body: 'Comment body must not be empty'
                    }
                })
            }

            const post = await Posts.findById(postId)
            if(post){
                // mongoose will turn these into accessible objects at runtime
                // unshift will add these new comments to the posts immediatly
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                })
                await post.save();
                return post;
            }else{
                throw new UserInputError('Post not found')
            }
        },
        async deleteComment(_, {postId, commentId}, context){
            const {username} = checkAuth(context);

            const post = await Posts.findById(postId)

            if(post){
                const commentIndex = post.comments.findIndex(c => c.id === commentId)
                try{
                    if(post.comments[commentIndex].username === username){
                        post.comments.splice(commentIndex, 1)
                        await post.save()
                        return post
                    } else{
                        throw new AuthenticationError('Action not allowed')
                    }
                }catch(err){
                    throw new UserInputError(`Comment not found. Error: ${err}`)
                }
                
            }else{
                throw new UserInputError('Post Not Found')
            }
        }
    }
}