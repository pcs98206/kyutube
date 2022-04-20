import express from "express";
import morgan from "morgan";
import session from "express-session";
import mongoStore from "connect-mongo";
import flash from "express-flash";
import rootRouter from './routers/rootRouter';
import userRouter from './routers/userRouter';
import videoRouter from './routers/videoRouter';
import apiRouter from './routers/apiRouter';
import { localsMilddleware } from './middleware';

const app = express();
const logger = morgan('dev');

app.set('view engine', "pug");
app.set('views', process.cwd()+"/src/views");

app.use(logger);
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
    secret: process.env.COOKIE_SECRET,
    store: mongoStore.create({mongoUrl : process.env.DB_URL}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));
app.use(flash());
app.use(localsMilddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;