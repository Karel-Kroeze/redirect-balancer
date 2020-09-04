import React from "react";
import { ITrial, TrialForm } from "./trial-form";
import {
    TextField,
    Paper,
    Slider,
    FormHelperText,
    IconButton,
    Grid,
    Fab,
} from "@material-ui/core";
import DeleteForeverRounded from "@material-ui/icons/DeleteForeverRounded";
import LockOpenRounded from "@material-ui/icons/LockOpenRounded";
import LockRounded from "@material-ui/icons/LockRounded";
import { ValidatedInput } from "./validated-text-field";
import { Field, FieldInputProps, FieldMetaProps, FormikProps } from "formik";

export class Condition extends React.Component {
    props!: {
        index: number;
    };

    render = () => {
        const { index } = this.props;
        return (
            <Paper className="condition" style={{ position: "relative" }}>
                <ValidatedInput
                    Child={TextField}
                    variant="outlined"
                    name={`conditions[${index}].label`}
                    label="Label"
                    fullWidth
                    margin="dense"
                ></ValidatedInput>
                <ValidatedInput
                    Child={TextField}
                    variant="outlined"
                    name={`conditions[${index}].target`}
                    label="Target"
                    fullWidth
                    margin="dense"
                ></ValidatedInput>
                <Grid
                    container
                    spacing={1}
                    justify="space-between"
                    alignItems="center"
                >
                    <Grid
                        item
                        xs
                        style={{ display: "flex", alignItems: "center" }}
                    >
                        <Field name={`conditions[${index}].weight`}>
                            {({
                                field,
                                meta,
                                form,
                            }: {
                                field: FieldInputProps<number>;
                                meta: FieldMetaProps<number>;
                                form: FormikProps<ITrial>;
                            }) => {
                                return (
                                    <>
                                        <Fab
                                            size="small"
                                            color="secondary"
                                            style={{
                                                position: "absolute",
                                                top: -8,
                                                right: -8,
                                                zIndex: 2,
                                            }}
                                            onClick={() =>
                                                TrialForm.onRemoveCondition(
                                                    index,
                                                    form.values,
                                                    form.setValues
                                                )
                                            }
                                        >
                                            <DeleteForeverRounded />
                                        </Fab>
                                        <Grid
                                            item
                                            container
                                            spacing={0}
                                            direction="column"
                                        >
                                            <Grid item>
                                                <Slider
                                                    style={{ width: "100%" }}
                                                    name={field.name}
                                                    value={field.value}
                                                    min={0}
                                                    max={1}
                                                    step={0.01}
                                                    valueLabelDisplay="auto"
                                                    disabled={
                                                        form.values.conditions[
                                                            index
                                                        ].locked
                                                    }
                                                    onChange={(_, value) => {
                                                        TrialForm.onConditionWeightChanged(
                                                            field.value -
                                                                (value as number),
                                                            form.values,
                                                            form.setValues,
                                                            index
                                                        );
                                                        form.setFieldValue(
                                                            field.name,
                                                            value
                                                        );
                                                        form.setFieldTouched(
                                                            field.name
                                                        );
                                                    }}
                                                    valueLabelFormat={(value) =>
                                                        value.round(2)
                                                    }
                                                ></Slider>
                                            </Grid>
                                            {!!meta.error && meta.touched && (
                                                <Grid
                                                    item
                                                    style={{
                                                        marginTop: "-1em",
                                                    }}
                                                >
                                                    <FormHelperText
                                                        error={true}
                                                    >
                                                        {meta.error}
                                                    </FormHelperText>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </>
                                );
                            }}
                        </Field>
                    </Grid>
                    <Grid item>
                        <Field name={`conditions[${index}].locked`}>
                            {({
                                field,
                                form,
                            }: {
                                field: FieldInputProps<boolean>;
                                form: FormikProps<ITrial>;
                            }) => {
                                return (
                                    <IconButton
                                        style={{ marginRight: 0 }}
                                        size="small"
                                        color={
                                            field.value ? "primary" : "default"
                                        }
                                        onClick={() =>
                                            form.setFieldValue(
                                                field.name,
                                                !field.value
                                            )
                                        }
                                        edge="start"
                                    >
                                        {field.value ? (
                                            <LockRounded></LockRounded>
                                        ) : (
                                            <LockOpenRounded></LockOpenRounded>
                                        )}
                                    </IconButton>
                                );
                            }}
                        </Field>
                    </Grid>
                </Grid>
            </Paper>
        );
    };
}
