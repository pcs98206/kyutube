import multer from 'multer';
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
    credentials: {
        accessKeyId:process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET
    }
});

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
    },
    storage: multerS3({
        s3: s3,
        bucket: 'kyutubeUpload',    
    })
});

export const videoUpload = multer({
    dest : 'uploads/videos',
    limits: {
        fileSize: 10000000
    },
    storage: multerS3({
        s3: s3,
        bucket: 'kyutubeUpload',    
    })
});
