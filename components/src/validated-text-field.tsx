import React from "react";
import { Field, FieldInputProps, FieldMetaProps } from "formik";

export class ValidatedInput<
    ChildComponent extends React.Component,
    ChildProps
> extends React.Component {
    props!: ChildProps & { Child: any; name: string };

    render = () => {
        return (
            <Field name={this.props.name}>
                {({
                    field,
                    meta,
                }: {
                    field: FieldInputProps<string>;
                    meta: FieldMetaProps<string>;
                }) => {
                    const showError = meta.touched && !!meta.error;
                    const { Child, ...props } = this.props;
                    return (
                        <Child
                            {...props}
                            {...field}
                            error={showError}
                            helperText={showError ? meta.error : null}
                        ></Child>
                    );
                }}
            </Field>
        );
    };
}
