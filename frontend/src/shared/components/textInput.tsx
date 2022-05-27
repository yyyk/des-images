import { ChangeEvent, useState } from 'react';
import { isValidCiphertext, isValidPlaintext } from 'src/shared/utils/des';
import { latin1Table } from 'src/shared/utils/latin1Table';
import { CIPHERTEXT_LENGTH, DEFAULT_CIPHERTEXT, DEFAULT_PLAINTEXT, PLAINTEXT_LENGTH } from 'src/shared/constants';
import { TextType } from 'src/mod/interfaces';

interface TextInputProps {
  defaultValue?: {
    plaintext: string;
    ciphertext: string;
  };
  textType: TextType;
  onChange?: (value: { plaintext: string; ciphertext: string; isValid: boolean }) => void;
}

const TextInput = ({
  defaultValue = { plaintext: DEFAULT_PLAINTEXT, ciphertext: DEFAULT_CIPHERTEXT },
  textType,
  onChange,
}: TextInputProps) => {
  const [text, setText] = useState({
    plaintextRaw: defaultValue.plaintext,
    plaintext: defaultValue.plaintext,
    ciphertext: defaultValue.ciphertext,
    isValidPlaintext: isValidPlaintext(defaultValue.plaintext),
    isValidCiphertext: isValidCiphertext(defaultValue.ciphertext),
  });

  const inputStateClasses =
    (textType === TextType.PLAINTEXT && text.plaintext.length === PLAINTEXT_LENGTH && text.isValidPlaintext) ||
    (textType === TextType.CIPHERTEXT && text.ciphertext.length === CIPHERTEXT_LENGTH && text.isValidCiphertext)
      ? 'focus:input-success'
      : (textType === TextType.PLAINTEXT && text.plaintext.length === 0) ||
        (textType === TextType.CIPHERTEXT && text.ciphertext.length === 0)
      ? ''
      : 'focus:input-warning';

  const hintText =
    (textType === TextType.PLAINTEXT && !text.isValidPlaintext) ||
    (textType === TextType.CIPHERTEXT && !text.isValidCiphertext)
      ? 'Invalid text'
      : textType === TextType.PLAINTEXT && text.plaintext.length <= PLAINTEXT_LENGTH
      ? `${PLAINTEXT_LENGTH - text.plaintext.length} characters left`
      : textType === TextType.PLAINTEXT
      ? `${text.plaintext.length - PLAINTEXT_LENGTH} characters over`
      : text.ciphertext.length <= CIPHERTEXT_LENGTH
      ? `${CIPHERTEXT_LENGTH - text.ciphertext.length} characters left`
      : `${text.ciphertext.length - CIPHERTEXT_LENGTH} characters over`;

  const handleTextInputOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ?? '';
    let result = { ...text };
    switch (textType) {
      case TextType.PLAINTEXT:
        const formattedValue = value
          .replace(/(\\x[0-9a-fA-F]{2})/g, (str) => latin1Table[str.toLowerCase()] ?? '')
          .replace(/\\[btnvfr]/g, (str) => latin1Table[str.toLowerCase()] ?? '');
        result = {
          ...result,
          plaintext: formattedValue,
          plaintextRaw: value,
          isValidPlaintext: isValidPlaintext(formattedValue),
        };
        break;
      case TextType.CIPHERTEXT:
        if (value.length <= 2) {
          setText({ ...text, ciphertext: '0x' });
          return;
        }
        result = {
          ...result,
          ciphertext: new RegExp(/^0x/).test(value) ? value : `0x${value}`,
          isValidCiphertext: isValidCiphertext(value),
        };
        break;
    }
    setText(result);
    onChange &&
      onChange({
        plaintext: result.plaintext,
        ciphertext: result.ciphertext,
        isValid: textType === TextType.PLAINTEXT ? result.isValidPlaintext : result.isValidCiphertext,
      });
  };

  return (
    <>
      <input
        className={`input input-bordered w-full ${inputStateClasses}`}
        type="text"
        name=""
        id=""
        placeholder="Type here"
        value={textType === TextType.PLAINTEXT ? text.plaintextRaw : text.ciphertext}
        onChange={handleTextInputOnChange}
      />
      <label className="label">
        <span className="label-text-alt">{hintText}</span>
      </label>
    </>
  );
};

export default TextInput;
