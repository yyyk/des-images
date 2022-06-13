import { ChangeEvent, useState } from 'react';
import { TextType } from 'src/mod/interfaces';

interface TextTypeSelectProps {
  defaultValue?: TextType;
  onChange?: (textType: TextType) => void;
}

const TextTypeSelect = ({ defaultValue = TextType.PLAINTEXT, onChange }: TextTypeSelectProps) => {
  const [textType, setTextType] = useState<TextType>(defaultValue);

  const handleOnChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TextType;
    setTextType(value);
    onChange && onChange(value);
  };

  return (
    <select
      className="select select-sm select-ghost select-bordered text-type"
      onChange={handleOnChange}
      defaultValue={textType}
    >
      <option value={TextType.PLAINTEXT}>Plaintext</option>
      <option value={TextType.CIPHERTEXT}>Ciphertext</option>
    </select>
  );
};

export default TextTypeSelect;
