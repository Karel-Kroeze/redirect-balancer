import { string, object, number, array } from "yup";
import { ICondition } from "./trial-form";

export const LabelValidator = string().label("Label").ensure().required();
export const URLValidator = string().label("Target").ensure().required().url();
export const SamplingTypeValidator = string()
    .label("Sampling type")
    .ensure()
    .required()
    .matches(/(random|balanced)/);
export const WeightValidator = number()
    .label("Weight")
    .defined()
    .moreThan(0)
    .lessThan(1);
export const ConditionValidator = object({
    label: LabelValidator,
    target: URLValidator,
    weight: WeightValidator,
}).defined();
export const TrialValidator = object({
    label: LabelValidator,
    sampling: SamplingTypeValidator,
    conditions: array(ConditionValidator)
        .defined()
        .min(2, "Trial must have at least 2 conditions.")
        .test(
            "trial.conditions",
            "Condition weights must add up to 1",
            (conditions: any) => {
                return (
                    conditions &&
                    Math.abs(conditions.sumBy((c: any) => c.weight) - 1) < 1e-4
                );
            }
        ),
}).defined();
