import { TextField, type TextFieldProps } from "@mui/material";
import { type UseControllerProps, useController } from "react-hook-form";

type Props = TextFieldProps & UseControllerProps;

export default function AppTextInput(props: Props) {
    const { fieldState, field } = useController({ ...props, defaultValue: props.defaultValue || '' });

    return (
        <TextField
            {...props}
            {...field}
            fullWidth
            variant={props.variant || 'outlined'}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
        />
    )
}
