import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: {type:String, required:true, trim:true, minlength: 2},
    description: {type:String, required:true, trim:true, maxlength:140},
    createdAt: {type:Date, required:true, default: Date.now},
    hashtags: [{type:String, required:true, trim:true}],
    meta: {
        views: {type:Number, default:0},
        rating: {type:Number, default:0}
    },
    fileUrl: {type: String, required: true},
    owner: {type:mongoose.Schema.Types.ObjectId, required:true, ref:"User"},
    comments : [{type:mongoose.Schema.Types.ObjectId, required:true, ref:"Comment"}],
    thumbUrl: {type: String, required: true},
});

videoSchema.static("formatHashtags", function(hashtags){
    return hashtags.split(",").map(word => (word.startsWith("#") ? word : `#${word}`))
});

const Video = mongoose.model("Video", videoSchema);
export default Video;