import { fireEvent, render, screen } from '@testing-library/react';
import DateInput from '.';

describe('<DateInput>', function () {
  it('shows label by default', function () {
    render(<DateInput />);
    expect(screen.getByTestId('date-input__label')).toBeInTheDocument();
  });

  it('hides label', function () {
    render(<DateInput showLabel={false} />);
    expect(screen.queryByTestId('date-input__label')).not.toBeInTheDocument();
  });

  it('takes default value prop', function () {});

  it('takes a value of a date', function () {
    const handleOnChange = jest.fn();
    const value = '2020-02-02';
    render(<DateInput onChange={handleOnChange} />);
    const input = screen.getByTestId('date-input__date-input');
    fireEvent.change(input, { target: { value } });
    expect(handleOnChange).toHaveBeenCalled();
    expect(handleOnChange).toHaveBeenCalledTimes(1);
    expect(handleOnChange).toHaveBeenCalledWith(value);
    expect(input).toBeValid();
    expect(input).toHaveValue(value);
    expect(input).toHaveDisplayValue(value);
  });

  it('has min date 2020-01-01', function () {
    const handleOnChange = jest.fn();
    const value = '2019-12-31';
    render(<DateInput onChange={handleOnChange} />);
    const input = screen.getByTestId('date-input__date-input');
    fireEvent.change(input, { target: { value } });
    expect(input).not.toBeValid();
  });
});
