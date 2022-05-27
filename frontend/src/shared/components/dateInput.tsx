import { ChangeEvent, useState } from 'react';
import { defaultTokenData } from 'src/shared/constants';

interface DateInputProps {
  showLabel?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const DEFAULT_MIN_DATE = '2020-01-01';

const DateInput = ({ showLabel = true, defaultValue, onChange }: DateInputProps) => {
  const [date, setDate] = useState(
    defaultValue ?? `${defaultTokenData.year}-${defaultTokenData.month}-${defaultTokenData.day}`,
  );
  const dateObj = new Date();
  const maxDate = `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(
    dateObj.getUTCDate(),
  ).padStart(2, '0')}`;

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const date = e.target.value;
    setDate(date);
    onChange && onChange(date);
  };

  return (
    <>
      {showLabel && (
        <label className="label" htmlFor="">
          <span className="label-text">choose a date</span>
        </label>
      )}
      <input
        className="input input-bordered w-full"
        type="date"
        name=""
        id=""
        value={date}
        min={DEFAULT_MIN_DATE}
        max={maxDate}
        onChange={handleOnChange}
      />
    </>
  );
};

export default DateInput;
