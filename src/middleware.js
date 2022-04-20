import multer from 'multer';

export const localsMilddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user || {};
    res.locals.siteName = "Kyutube";
    next();
};

export const protectorMiddleware = (req, res, next) => {
    if(!req.session.loggedIn){
        req.flash("error", "Not authorized");
        return res.redirect("/login");
    }else{
        next();
    }
};

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn){
        next();
    }else{
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
};

export const avatarUpload = multer({
    dest : 'uploads/avatars',
    limits: {
        fileSize: 3000000
    }
});

export const videoUpload = multer({
    dest : 'uploads/videos',
    limits: {
        fileSize: 10000000
    }
});
