import express from 'express';
import { watch, getEdit, postEdit, getUpload, postUpload, getDelete } from "../controllers/videoController";
import { protectorMiddleware, publicOnlyMiddleware, videoUpload } from "../middleware";

export const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.get("/:id([0-9a-f]{24})/edit", protectorMiddleware, getEdit);
videoRouter.post("/:id([0-9a-f]{24})/edit", protectorMiddleware, postEdit);
videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(videoUpload.fields([
    {name:"video", maxCount:1}, {name:"thumb", maxCount:1}
]), postUpload)
videoRouter.get("/:id([0-9a-f]{24})/delete", protectorMiddleware, getDelete);

export default videoRouter;