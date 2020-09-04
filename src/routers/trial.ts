import { Router } from "express";
import { Trial } from "../entity/trial";
import { User } from "../entity/user";
import shortid from "shortid";

const router = Router();

router.get("/", async (req, res) => {
    const user = req.user as User;
    const trials = await Trial.find({ where: { user: user.id } });
    res.render("trials/index", { trials });
});

router.post("/", async (req, res, next) => {
    try {
        const trial = new Trial();
        Object.assign(trial, req.body, { user: req.user });
        trial.hash = shortid.generate();
        await trial.save();
        req.flash("success", `Trial '${trial.label}' created!`);
        res.redirect("/trials");
    } catch (err) {
        console.error({ err });
        next(err);
    }
});

router.get("/create", async (req, res) => {
    res.render("trials/create");
});

router.get("/update/:id", async (req, res) => {
    const trial = await Trial.findOne({
        where: { user: (req.user as User).id, id: req.params.id },
    });
    if (!trial) {
        req.flash("warning", `Trial not found.`);
        res.redirect("/trials");
    } else {
        res.render("trials/update", { trial });
    }
});

router.post("/update/:id", async (req, res) => {
    const trial = await Trial.findOne({
        where: { user: (req.user as User).id, id: req.params.id },
    });
    if (!trial) {
        req.flash("warning", `Trial not found.`);
        res.redirect("/trials");
    } else {
        Object.assign(trial, req.body);
        await trial.save();
        req.flash("success", `Trial '${trial.label}' updated.`);
        res.redirect(`/trials/:id`);
    }
});

router.get("/:id", async (req, res) => {
    const trial = await Trial.findOne({
        where: { user: (req.user as User).id, id: req.params.id },
    });

    console.log({ trial, user: req.user });
    if (!trial) {
        req.flash("warning", `Trial not found.`);
        res.redirect("/trials");
    } else {
        res.render("trials/details", { trial });
    }
});

router.get("/delete/:id", async (req, res) => {
    const trial = await Trial.findOne({
        where: { user: (req.user as User).id, id: req.params.id },
    });

    if (!trial) {
        req.flash("warning", `Trial not found.`);
    } else {
        try {
            await Promise.all(trial.conditions.map((c) => c.remove()));
            await trial.remove();
            req.flash("info", `trial '${trial.label}' removed`);
        } catch (err) {
            req.flash(
                "warning",
                `error removing '${trial.label}': ${(err as Error).message}`
            );
        }
    }
    res.redirect("/trials");
});

export const TrialRouter = router;
