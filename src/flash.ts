import { Request, Response, NextFunction } from "express";

interface FlashMessages {
    [level: string]: string[];
}

interface FlashMessage {
    level: FlashLevel;
    message: string;
}

type FlashLevel = "info" | "success" | "warning" | "danger";

declare global {
    namespace Express {
        interface Response {
            locals: {
                flash: FlashMessages;
                getMessages(): FlashMessage[];
            };
        }

        interface Request {
            flashMessages: FlashMessages;
            flash: (level: FlashLevel, msg?: string) => void | string[];
        }
    }
}

export function flash() {
    return function (req: Request, res: Response, next: NextFunction) {
        if (!req.session) throw "sessions must be enabled!";
        req.flashMessages = res.locals.flash = req.session.flash =
            req.session.flash ?? {};
        res.locals.getMessages = () => {
            const messages = [];
            for (const level in req.flashMessages) {
                if (req.flashMessages.hasOwnProperty(level)) {
                    const levelMsgs = req.flashMessages[level];
                    messages.push(
                        ...levelMsgs.map((message) => {
                            return { level, message };
                        })
                    );
                }
            }
            delete req.session?.flash;
            return messages;
        };
        req.flash = (level: FlashLevel, msg?: string) => {
            if (msg) {
                req.flashMessages[level] = req.flashMessages[level] || [];
                req.flashMessages[level].push(msg);
                return;
            } else {
                return req.flashMessages[level];
            }
        };
        next();
    };
}
