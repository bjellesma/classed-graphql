const Posts = require('../../models/Posts')

module.exports = {
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