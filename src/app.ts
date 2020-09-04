// set up env variables
import path from "path";
import dotenv from "dotenv";
const env = dotenv.config({
    path: path.join(__dirname, "../.env"),
});

// where should we listen?
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const HOST = process.env.HOST || "localhost";

import express, { Request, Response, NextFunction } from "express";
import { AddressInfo } from "net";
import { AuthRouter, isAuthenticated } from "./auth/auth";
import { flash } from "./flash";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";

// database and models
import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/user";
import { TrialRouter } from "./routers/trial";
import { RandomizerRouter } from "./routers/randomizer";
import { Trial } from "./entity/trial";
import { Condition } from "./entity/condition";
export const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET || "dev-secret"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "dev-secret",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use(flash());

app.use("/assets", express.static(path.join(__dirname, "../assets")));
app.set("view engine", "pug");
app.use("/auth", AuthRouter);
app.use("/trials", isAuthenticated, TrialRouter);
app.use("/randomize", RandomizerRouter);

app.use("/", (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/trials");
    res.render("public", {
        title: "Randomizer",
        subtitle: "The best way to randomize trials.",
    });
});

// start listening
const server = app.listen(PORT, HOST, async () => {
    const address = server.address() as AddressInfo;
    console.log(`listening on http://${address.address}:${address.port}`);
    const db = await createConnection({
        type: "mysql",
        host: process.env.MYSQL_HOST,
        port: 3306,
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        entities: [User, Trial, Condition],
        synchronize: true,
    });
    console.log(`database connected`);
});
