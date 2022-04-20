import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from 'node-fetch';
import Video from '../models/Video';

export const getJoin = (req, res) => {
    return res.render('join', {pageTitle: "Join"});
};

export const postJoin = async(req, res) => {
    const { email,
            username,
            password,
            password2,
            name,
            location, } = req.body;
    const exists = await User.exists({$or: [{email}, {username}]});
    if(exists){
        return res.status(400).render('join', {pageTitle: "Join", errorMessage :"This email/username is already taken"})
    };
    if(password !== password2){
        return res.status(400).render('join', {pageTitle: "Join", errorMessage :"Password confirmation does not match"})
    };
    try{
        await User.create({
            email,
            username,
            password,
            name,
            location,
        });
        return res.redirect("/login");
    } catch(error){
        return res.status(400).render("join", {pageTitle:"Join", errorMessage:error._message})
    };
};

export const getLogin = (req, res) => {
    return res.render("login", {pageTitle: "Login"});
};

export const postLogin = async(req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({username});
    if(!user){
        return res.status(400).render("login", {pageTitle: "Login", errorMessage: "An account with this username deos not exists"});
    };
    if(user.socialOnly){
        return res.status(400).render("login", {pageTitle: "Login", errorMessage: "You already have Github account"});
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {pageTitle: "Login", errorMessage: "Wrong password"});
    };
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize?";
    const config = {
        client_id : process.env.GH_CLIENT,
        scope : "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const url = baseUrl + params;
    return res.redirect(url);
};

export const finishGithubLogin = async(req, res) => {
    const { code } = req.query;
    const config = {
        client_id : process.env.GH_CLIENT,
        client_secret : process.env.GH_SECRET,
        code,
    };
    const baseUrl = "https://github.com/login/oauth/access_token?";
    const params = new URLSearchParams(config).toString();
    const url = baseUrl + params;
    const data = await(await fetch(url, {
        method : "post",
        headers : {
            Accept: "application/json"
        }
    })).json();
    if ("access_token" in data){
        const { access_token } = data;
        const userData =  await(await fetch("https://api.github.com/user", {
            headers : {
                Authorization : `token ${access_token}`
            }
        })).json();
        const emailData =  await(await fetch("https://api.github.com/user/emails", {
            headers : {
                Authorization : `token ${access_token}`
            }
        })).json();
        const emailObj = emailData.find((email) => email.primary==true && email.verified==true);
        if(!emailObj){
            return res.redirect("/login");
        };
        let user = await User.findOne({email: emailObj.email});
        if(!user){
                user =  await User.create({
                email: emailObj.email,
                username: userData.login,
                password: "",
                name: userData.name,
                location: userData.location,
                socialOnly: true,
                avatarUrl: userData.avatar_url
            });
            return res.redirect("/");
        }
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");
    }else{
        return res.redirect("/login");
    }
};

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
}

export const getEdit = async(req, res) => {
    return res.render("edit-profile", {pageTitle:"Edit Profile"});
};

export const postEdit = async(req, res) => {
    const {
        session : {
            user : { _id, avatarUrl }
        },
        body: { email, username, name, location },
        file
    } = req;
    const existEmail = await User.findOne({email});
    const existUsername = await User.findOne({username});
    if((existUsername != null && existUsername._id != _id) || (existEmail != null && existEmail._id != _id)){
        return res.render("edit-profile", {pageTitle:"Edit Profile", errorMessage: "This email/username is already taken"});
    }
    const updateUser = await User.findByIdAndUpdate(_id, {
        email, 
        username, 
        name, 
        location,
        avatarUrl : file? file.path : avatarUrl
    }, {new:true});
    req.session.user = updateUser;
    return res.redirect("/");
};

export const getChangePassword = (req, res) => {
    if(req.session.user.socialOnly === true){
        req.flash("error", "Can't change password");
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle: "Change Password"});
};

export const postChangePassword = async(req, res) => {
    const {
        session: {
            user: {_id}
        },
        body: {oldPassword, newPassword, newPasswordComfirm}
    } = req;
    const user = await User.findById({_id});
    const ok =await bcrypt.compare(oldPassword, user.password);
    if(!ok){
        return res.status(400).render("users/change-password", {pageTitle: "Change Password", errorMessage: "Old password does not match"})
    };
    if(newPassword !== newPasswordComfirm){
        return res.status(400).render("users/change-password", {pageTitle: "Change Password", errorMessage: "New assword does not match with the confirm"})
    };
    user.password = newPassword;
    await user.save();
    req.flash("info", "Password Updated");
    return res.redirect("/logout");
};

export const handleDeleteUser = (req, res) => {
    return res.send("handleDeleteUser");
};


export const profile = async(req, res) =>{
    const {id} = req.params;
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User"
        }
    }).populate("comments");
    console.log(user);
    if(!user){
        return res.status(404).render('404', {pageTitle:"User not found"});
    };
    return res.render("users/profile", {pageTitle: `${user.name}` , user});
};