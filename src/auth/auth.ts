import { Router, NextFunction, Request, Response, request } from "express";
import { GoogleAuthRouter } from "./google";
import passport from "passport";
import { User } from "../entity/user";

passport.serializeUser(async (user: User, done) => {
    return done(null, user.email);
});

passport.deserializeUser(async (email: string, done) => {
    try {
        const user = await GetUser(email);
        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

export async function isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (req.isAuthenticated()) return next();
    if (process.env.ENV == "development") {
        const user = await User.findOne();
        if (user) {
            req.flash("info", "DEV: auto-logged in");
            return req.logIn(user, next);
        }
    }
    req.flash("warning", "Access not allowed");
    res.redirect("/auth/login");
}

const router = Router();

router.get("/login", (req, res) => {
    res.render("auth/login", { noLoginWidget: true });
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

router.use("/google", GoogleAuthRouter);

export async function GetUser(email: string) {
    try {
        return await User.findOne({ email });
    } catch (err) {
        console.error({ err });
        return null;
    }
}

export const AuthRouter = router;
