import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Router } from "express";
import { GetUser } from "./auth";
import { User } from "../entity/user";
import fetch from "node-fetch";
import sharp from "sharp";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_AUTH_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
            callbackURL: `http://${
                process.env.VIRTUAL_HOST || "localhost:3000"
            }/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                let user = await GetUser(profile._json.email);
                if (!user) {
                    user = new User();
                    user.email = profile._json.email;

                    // fetch profile image
                    if (profile._json.picture) {
                        let res = await fetch(profile._json.picture);
                        try {
                            let buffer = await sharp(await res.buffer())
                                .resize(64, 64)
                                .toFormat("png")
                                .toBuffer();
                            user.avatar = `data:image/png;base64,${buffer.toString(
                                "base64"
                            )}`;
                        } catch (err) {
                            console.error({ err });
                        }
                    }
                    await user.save();
                }
                return cb(undefined, user);
            } catch (err) {
                return cb(err);
            }
        }
    )
);

const router = Router();
router.get("/", passport.authenticate("google", { scope: ["email"] }));
router.get(
    "/callback",
    passport.authenticate("google", {
        failureRedirect: "/auth/login",
        failureFlash: true,
        successRedirect: "/",
    })
);

export const GoogleAuthRouter = router;
