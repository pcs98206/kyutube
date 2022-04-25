import multer from 'multer';
import aws from "aws-sdk";
import multerS3 from "multer-s3";

const s3 = new aws.S3({
    credentials: {
        accessKeyId : process.env.AWS_ID,
        secretAccessKey : process.env.AWS_SECRET
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

const isHeroku = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: 'kyutube/images',
    Condition: {
        StringEquals: {
        "s3:x-amz-acl": ["public-read"],
        },
    }
});

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: 'kyutube/videos',
    Condition: {
        StringEquals: {
        "s3:x-amz-acl": ["public-read"],
        },
    }
});

export const avatarUpload = multer({
    storage: isHeroku ? s3ImageUploader : undefined,
    dest : 'uploads/avatars',
    limits: {
        fileSize: 3000000
    }
});

export const videoUpload = multer({
    storage: isHeroku ? s3VideoUploader : undefined,
    dest : 'uploads/videos',
    limits: {
        fileSize: 10000000
    }
});
