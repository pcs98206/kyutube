import express from 'express';
import { 
    handleDeleteUser, 
    profile, 
    startGithubLogin, 
    finishGithubLogin,
    getEdit,
    postEdit,
    getChangePassword,
    postChangePassword
} from "../controllers/userController";
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from "../middleware";

export const userRouter = express.Router();

userRouter.get("/delete", handleDeleteUser);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single('avatar'), postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword)
userRouter.get("/:id", profile);


export default userRouter;