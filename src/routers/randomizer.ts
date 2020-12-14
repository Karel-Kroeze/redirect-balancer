import { Request, Router } from "express";
import { Trial } from "../entity/trial";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import sum from "lodash/sum";
import ms from "ms";

const router = Router();

router.get("/:hash", async (req, res) => {
    try {
        const trial = await Trial.findOneOrFail({ hash: req.params.hash });
        const {
            query: { ignore_cookie },
        } = req;
        console.log({
            trial,
            search: req.url,
            params: req.params,
            ignore_cookie,
            cookies: req.cookies,
            status: trial.conditions.map((c) => `${c.weight} :: ${c.count}`),
        });

        if (!ignore_cookie && req.cookies[trial.hash] !== undefined) {
            const i = parseInt(req.cookies[trial.hash]);
            const condition = trial.conditions[i];
            console.log(
                `return visit, assigned to ${condition.label}, forwarding to ${condition.target}`
            );
            res.redirect(getTargetUrl(condition.target, req));
        } else {
            const i = takeDraw(trial);
            const condition = trial.conditions[i];
            condition.count++;
            await condition.save();
            console.log(
                `new visitor, assigned to ${condition.label}, forwarding to ${condition.target}`
            );
            res.cookie(trial.hash, i, { maxAge: ms("5 years") });
            res.redirect(getTargetUrl(condition.target, req));
        }
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

function getTargetUrl(target: string, request: Request): string {
    const { protocol, hostname, baseUrl, url } = request;
    const incomingUrl = new URL(protocol + "://" + hostname + baseUrl + url);
    const targetUrl = new URL(target);

    incomingUrl.searchParams.forEach((value, key) => {
        if (key !== "ignore_cookie") targetUrl.searchParams.append(key, value);
    });

    return targetUrl.toString();
}

function getBalancedWeights(trial: Trial): number[] {
    // invert the current counts to get 'base' weights
    let weights = trial.conditions.map((c) => c.weight / (c.count + 1));

    // get normalizing constant
    let normalizingConstant = 1 / sum(weights);

    // normalize weights
    for (let i in weights) weights[i] *= normalizingConstant;

    return weights;
}

function getWeigths(trial: Trial): number[] {
    return trial.conditions.map((c) => c.weight);
}

function takeDraw(trial: Trial): number {
    let r = Math.random();
    let W =
        trial.sampling == "balanced"
            ? getBalancedWeights(trial)
            : getWeigths(trial);
    let n = trial.conditions.length;
    let i = 0;
    let w = 0;

    while (i < n) {
        w += W[i];
        if (r <= w) return i;
        i++;
    }
    throw "no selection - bad weights?";
}

export const RandomizerRouter = router;
