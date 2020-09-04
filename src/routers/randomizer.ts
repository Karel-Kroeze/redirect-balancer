import e, { Router } from "express";
import { Trial } from "../entity/trial";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

const router = Router();

router.get("/:hash", async (req, res) => {
    try {
        const trial = await Trial.findOneOrFail({ hash: req.params.hash });
        const cookie = req.cookies;
        console.log({ trial, cookie });
    } catch (error) {
        if (error instanceof EntityNotFoundError) {
            if (req.user) {
                req.flash("warning", "trial not found");
                res.redirect("/trials");
            } else {
                res.render("error", { error });
            }
        } else {
            console.error(error);
            res.render("error", { error });
        }
    }
});

export const RandomizerRouter = router;
