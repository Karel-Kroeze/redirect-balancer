// set up env variables
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import { AddressInfo } from "net";
import { AuthRouter, isAuthenticated } from "./auth/auth";
import { flash } from "./flash";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";

// database and models
import "reflect-metadata";
import { createConnection, ConnectionOptions } from "typeorm";
import { Condition } from "./entity/condition";
import { Trial } from "./entity/trial";
import { User } from "./entity/user";

import { TrialRouter } from "./routers/trial";
import { RandomizerRouter } from "./routers/randomizer";
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
const server = app.listen(3000, "0.0.0.0", async () => {
    const address = server.address() as AddressInfo;
    console.log(`listening on http://${address.address}:${address.port}`);
    try {
        const connectionOptions: ConnectionOptions = {
            type: "mysql",
            entities: [Condition, Trial, User],
            synchronize: true,
            host: process.env.MYSQL_HOST,
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        };
        // console.log({ connectionOptions });
        await createConnection(connectionOptions);
        console.log(`database connected`);
    } catch (err) {
        console.error(
            `Error connecting to database: \n\t${
                process.env.MYSQL_HOST
            }:${3306}\n\t${err}`
        );
        process.exit(1); // exit so that docker will restart when DB _is_ available
        // todo: use a wait-for wrapper?
    }
});
