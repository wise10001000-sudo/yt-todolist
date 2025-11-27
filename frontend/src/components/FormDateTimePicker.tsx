import React from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';

interface FormDateTimePickerProps {
  name: string;
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  [key: string]: any;
}

const FormDateTimePicker: React.FC<FormDateTimePickerProps> = ({
  name,
  label,
  value,
  onChange,
  ...props
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <DateTimePicker
        label={label}
        value={value}
        onChange={onChange}
        {...props}
        slotProps={{
          textField: {
            fullWidth: true,
            margin: 'normal',
          }
        }}
      />
    </LocalizationProvider>
  );
};

export default FormDateTimePicker;