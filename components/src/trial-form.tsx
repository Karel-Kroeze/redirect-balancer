import React from "react";
import ReactDom from "react-dom";
import ScopedCssBaseline from "@material-ui/core/ScopedCssBaseline";
import { Formik, Field, FieldMetaProps, FormikHelpers } from "formik";
import { TextField, MenuItem, Button, FormHelperText } from "@material-ui/core";
import AddRounded from "@material-ui/icons/AddRounded";
import LoopRounded from "@material-ui/icons/LoopRounded";
import { TrialValidator } from "./validator";
import { ValidatedInput } from "./validated-text-field";
import { Condition } from "./condition";
import "./style.sass";
import sumBy from "lodash/sumBy";

Array.prototype.sumBy = function <T>(by: string | ((el: T) => number)) {
    return sumBy(this, by);
};

Number.prototype.round = function (this: number, digits: number): number {
    const exp = Math.pow(10, digits);
    return Math.round(this * exp) / exp;
};

export type url = string;
export interface ICondition {
    label: string;
    key: string | number;
    target: url;
    weight: number;
    locked: boolean;
    id?: number;
}

export type samplingType = "balanced" | "random";
const samplingTypes = ["balanced", "random"];
export interface ITrial {
    label: string;
    sampling: samplingType;
    conditions: ICondition[];
}

export interface IFormProps {
    target: string;
    method: "POST" | "GET";
}
const DefaultFormProps: IFormProps = {
    target: "/",
    method: "POST",
};

export interface IFormState {
    ref: React.RefObject<HTMLFormElement>;
}

export const DefaultTrial: ITrial = {
    label: "",
    sampling: "random",
    conditions: [
        {
            label: "Condition A",
            key: "default-A",
            target: "",
            weight: 0.5,
            locked: false,
        },
        {
            label: "Condition B",
            key: "default-B",
            target: "",
            weight: 0.5,
            locked: false,
        },
    ],
};

export const TrialValidation = {};

export class TrialForm extends React.Component {
    state: {
        form: IFormProps;
        trial: ITrial;
        edit: boolean;
    };
    ref: React.RefObject<HTMLFormElement>;

    static conditionKey = 1;

    constructor(props: any) {
        super(props);
        this.state = {
            form: DefaultFormProps,
            trial: DefaultTrial,
            edit: false,
        };
        this.ref = React.createRef();
    }

    componentDidMount = () => {
        // try get parent with #trial-form tag
        const parent = this.ref.current?.closest("#trial-form") as HTMLElement;
        const { trial, ...form } = parent?.dataset;
        const edit = !!trial;
        console.log({ trial, form, edit });
        this.setState({
            form: form ?? DefaultFormProps,
            trial: trial ? JSON.parse(trial) : DefaultTrial,
            edit,
        });
    };

    onAddCondition = (trial: ITrial, setValues: (values: ITrial) => void) => {
        const movable = trial.conditions.filter((c) => !c.locked);
        const movableWeight = movable.sumBy((c) => c.weight);
        const weight = movableWeight / (movable.length + 1);
        const condition = {
            label: "",
            key: `new-${TrialForm.conditionKey++}`,
            target: "",
            weight,
            locked: false,
        };
        TrialForm.updateConditionWeights(-weight, trial.conditions);
        trial.conditions.push(condition);
        setValues(trial);
    };

    static onRemoveCondition = (
        index: number,
        trial: ITrial,
        setValues: (values: ITrial) => void
    ) => {
        const condition = trial.conditions.splice(index, 1)[0];
        TrialForm.updateConditionWeights(condition.weight, trial.conditions);
        setValues(trial);
    };

    static onConditionWeightChanged = (
        weight: number,
        trial: ITrial,
        setValues: (trial: ITrial) => void,
        ignore?: number
    ) => {
        const conditions = trial.conditions.filter((_, i) => i !== ignore);
        TrialForm.updateConditionWeights(weight, conditions);

        // we've been editing the _original_ condition objects (value types)
        // is that wise? -- apparently it's fine?
        setValues(trial);
    };

    static updateConditionWeights = (
        weight: number,
        conditions: ICondition[]
    ) => {
        const movableConditions = conditions.filter((c) => !c.locked);
        const movableCount = movableConditions.length;
        const movableWeight = sumBy(movableConditions, (c) => c.weight);

        // adding, spread over conditions evenly
        if (weight > 0) {
            if (movableCount > 0) {
                const moving = weight / movableCount;
                movableConditions.forEach((c) => (c.weight += moving));
            } else {
                const immovableConditions = conditions.filter((c) => c.locked);
                const moving = weight / immovableConditions.length;
                immovableConditions.forEach((c) => (c.weight += moving));
            }
        }

        // removing, take away proportionally
        if (weight < 0) {
            // take from movable first
            weight = -weight;
            if (movableWeight > 0) {
                const moving = Math.min(movableWeight, weight) / movableWeight;
                movableConditions.forEach(
                    (c) => (c.weight -= c.weight * moving)
                );
            }

            // take from immovable to cover the remainder
            if (weight > movableWeight) {
                const immovableConditions = conditions.filter((c) => c.locked);
                const immovableWeight = sumBy(
                    immovableConditions,
                    (c) => c.weight
                );
                const moving = (weight - movableWeight) / immovableWeight;
                immovableConditions.forEach(
                    (c) => (c.weight -= c.weight * moving)
                );
            }
        }
    };

    balanceConditionWeights = (
        trial: ITrial,
        setValues: (trial: ITrial) => void
    ) => {
        const movableConditions = trial.conditions.filter((c) => !c.locked);
        const movableWeight =
            1 - trial.conditions.filter((c) => c.locked).sumBy((c) => c.weight);
        movableConditions.forEach(
            (c) => (c.weight = movableWeight / movableConditions.length)
        );
        setValues(trial);
    };

    onSubmit = async (
        trial: ITrial,
        formik: FormikHelpers<ITrial>
    ): Promise<any> => {
        // if we got here that means validation passed.
        formik.setSubmitting(true);
        return fetch(this.state.form.target, {
            method: this.state.form.method ?? "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(trial),
        })
            .then((response) => {
                if (response.redirected) window.location.href = response.url;
                else window.location.href = "/trials";
            })
            .catch((err) => {
                console.log(err);
            });
    };

    render() {
        return (
            <ScopedCssBaseline>
                <Formik
                    // done: check if componentDidMount allows us to change
                    // initial values, or if that is too late
                    // answer: it does if you set enableReinitialize to true.
                    initialValues={this.state.trial}
                    onSubmit={this.onSubmit}
                    validationSchema={TrialValidator}
                    enableReinitialize={true}
                >
                    {({ values, setValues, handleSubmit, isSubmitting }) => {
                        return (
                            <form
                                ref={this.ref}
                                {...this.state.form}
                                onSubmit={handleSubmit}
                            >
                                <ValidatedInput
                                    Child={TextField}
                                    variant="outlined"
                                    name="label"
                                    label="Label"
                                    fullWidth
                                    margin="dense"
                                ></ValidatedInput>
                                <ValidatedInput
                                    Child={TextField}
                                    name="sampling"
                                    variant="outlined"
                                    select
                                    fullWidth
                                    margin="dense"
                                    label="Sampling"
                                >
                                    {samplingTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </ValidatedInput>
                                {values.conditions.map((condition, index) => {
                                    return (
                                        <Condition
                                            // todo; give conditions a key again
                                            key={condition.id ?? condition.key}
                                            index={index}
                                        ></Condition>
                                    );
                                })}
                                <Field name="conditions">
                                    {({
                                        meta,
                                    }: {
                                        meta: FieldMetaProps<Array<ICondition>>;
                                    }) => {
                                        if (
                                            meta.touched &&
                                            !!meta.error &&
                                            !Array.isArray(meta.error)
                                        ) {
                                            return (
                                                <FormHelperText error={true}>
                                                    {meta.error}
                                                </FormHelperText>
                                            );
                                        } else return null;
                                    }}
                                </Field>
                                <div className="button-bar">
                                    <div>
                                        <Button
                                            onClick={() =>
                                                this.onAddCondition(
                                                    values,
                                                    setValues
                                                )
                                            }
                                        >
                                            <AddRounded />
                                            add condition
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                this.balanceConditionWeights(
                                                    values,
                                                    setValues
                                                )
                                            }
                                        >
                                            <LoopRounded />
                                            balance weights
                                        </Button>
                                    </div>

                                    <Button
                                        variant="contained"
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <LoopRounded className="rotating"></LoopRounded>
                                        ) : this.state.edit ? (
                                            "Update"
                                        ) : (
                                            "Create"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        );
                    }}
                </Formik>
            </ScopedCssBaseline>
        );
    }
}

const trialForm = <TrialForm></TrialForm>;
ReactDom.render(trialForm, document.getElementById("trial-form"));
