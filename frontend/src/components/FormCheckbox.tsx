import React from 'react';
import type { CheckboxProps } from '@mui/material';
import { FormControl, FormLabel, FormControlLabel, Checkbox } from '@mui/material';

interface FormCheckboxProps extends Omit<CheckboxProps, 'name' | 'onChange'> {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({
  name,
  label,
  checked,
  onChange,
  ...props
}) => {
  const handleChange = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onChange(checked);
  };

  return (
    <FormControl component="fieldset" variant="standard">
      <FormLabel component="legend">{label}</FormLabel>
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            checked={checked}
            onChange={handleChange}
            {...props}
          />
        }
        label={label}
      />
    </FormControl>
  );
};

export default FormCheckbox;