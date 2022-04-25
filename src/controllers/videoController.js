import User from '../models/User';
import Video from "../models/Video";
import Comment from "../models/Comment";
import { async } from 'regenerator-runtime';

export const home = async(req, res) => {
    const videos = await Video.find({}).populate('owner').sort({createdAt:"desc"});
    return res.render('home', {pageTitle: "Home", videos});
};

export const watch = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    if (!video){
        return res.status(404).render("404", {pageTitle:"Video not found"});
    }
    return res.render("watch", {pageTitle:video.title, video});
};

export const getEdit = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video){
        return res.status(400).render("404", {pageTitle:"Video not found"});
    };
    if(String(video.owner) != String(req.session.user._id)){
        req.flash("error", "Not authorized");
        return res.status(403).redirect("/");
    };
    return res.render("edit", {pageTitle:`Editing ${video.title}`, video});
};

export const postEdit = async(req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.exists({_id : id});
    if (!video){
        return res.status(404).render("404", {pageTitle:"Video not found"});
    };
    if(String(video.owner) != String(req.session.user._id)){
        req.flash("error", "You are not the owner of the video");
        return res.status(403).redirect("/");
    };
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    });
    req.flash("success", "Changes saved");
    return res.redirect(`/`);
};

export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle:"Upload Video"});
};

export const postUpload = async(req, res) => {
    const {user : {_id}} = req.session;
    const { title, description, hashtags } = req.body;
    const isHeroku = process.env.NODE_ENV === "production";
    const { video, thumb } = req.files;
    try{
        const newVideo = await Video.create({
            title,
            description,
            hashtags: Video.formatHashtags(hashtags),
            fileUrl : isHeroku ? video[0].location : video[0].path,
            thumbUrl: isHeroku ? thumb[0].location: video[0].path,
            owner : _id
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    }catch(error){
        return res.status(400).render("upload", {pageTitle:"Upload Video", errorMessage: error._message});
    };
};

export const getDelete = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    const {user:{_id}} = req.session;
    const user = await User.findById(_id)
    if (!video){
        return res.status(400).render("404", {pageTitle:"Video not found"});
    };
    if(String(video.owner) != String(req.session.user._id)){
        req.flash("error", "Not authorized");
        return res.status(403).redirect("/");
    };
    await Video.findByIdAndDelete(id);
    user.videos.splice(user.videos.indexOf(id),1);
    user.save();
    return res.redirect("/");
};

export const search = async(req, res) => {
    const {keyword} = req.query;
    let videos = [];
    if(keyword){
        videos =  await Video.find({
            title: {
                $regex: new RegExp(keyword, "i")
            }
        }).populate('owner');
    };
    return res.render('search', {pageTitle:"Search", videos});
};

export const registerView = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.sendStatus(404);
    };
    video.meta.views = video.meta.views+1;
    await video.save();
    return res.sendStatus(200);
};

export const createComment = async(req, res) => {
    const {
        params: {id},
        body: {text}
    }= req;
    const video = await Video.findById(id);
    const user = await User.findById(req.session.user._id);
    if(!video){
        return res.sendStatus(404);
    };
    const comment = await Comment.create({
        text,
        owner : req.session.user._id,
        video : id
    });
    video.comments.push(comment._id);
    video.save();
    user.comments.push(comment._id);
    user.save();
    return res.status(201).json({newCommentId: comment._id});
};

export const deleteComment = async(req, res) => {
    const {
        params: {id},
    }= req;
    const comment = await Comment.findById(id);
    const commentOwner = comment.owner;
    const videoId = comment.video;
    if(String(commentOwner) !== String(req.session.user._id)){
        return res.sendStatus(404);
    };
    await Comment.findByIdAndRemove(id);
    const video = await Video.findById(videoId);
    const videoCommentList = video.comments;
    const videoCommentIndex = videoCommentList.indexOf(id);
    videoCommentList.splice(videoCommentIndex, 1);
    video.comments = videoCommentList;
    video.save();

    const user = await User.findById(req.session.user._id);
    const userCommentList = user.comments;
    const userCommentIndex = userCommentList.indexOf(req.session.user._id);
    userCommentList.splice(userCommentIndex, 1);
    user.comments = userCommentList;
    user.save();
    return res.sendStatus(200);
};