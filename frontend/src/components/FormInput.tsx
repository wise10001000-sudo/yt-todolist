import React from 'react';
import type { TextFieldProps } from '@mui/material';
import { TextField } from '@mui/material';

interface FormInputProps extends Omit<TextFieldProps, 'name' | 'label' | 'error' | 'helperText'> {
  name: string;
  label: string;
  error?: boolean;
  helperText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <TextField
      name={name}
      label={label}
      error={error}
      helperText={helperText}
      fullWidth
      margin="normal"
      {...props}
    />
  );
};

export default FormInput;