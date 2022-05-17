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
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);

  const handleTextInputOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ?? '';
    let result = { ...text };
    if (textType === TextType.PLAINTEXT) {
      const formattedValue = value
        .replace(/(\\x[0-9a-fA-F]{2})/g, (str) => latin1Table[str.toLowerCase()] ?? '')
        .replace(/\\[btnvfr]/g, (str) => latin1Table[str.toLowerCase()] ?? '');
      result = {
        ...result,
        plaintext: formattedValue,
        plaintextRaw: value,
        isValidPlaintext: isValidPlaintext(formattedValue),
      };
    } else if (textType === TextType.CIPHERTEXT) {
      if (value.length <= 2) {
        setText({ ...text, ciphertext: '0x' });
        return;
      }
      result = {
        ...result,
        ciphertext: new RegExp(/^0x/).test(value) ? value : `0x${value}`,
        isValidCiphertext: isValidCiphertext(value),
      };
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
        className={`input input-bordered w-full ${
          isTextInputFocused
            ? (textType === TextType.PLAINTEXT &&
                (!text.isValidPlaintext ||
                  (text.plaintext.length !== 0 && text.plaintext.length !== PLAINTEXT_LENGTH))) ||
              (textType === TextType.CIPHERTEXT &&
                (!text.isValidCiphertext ||
                  (text.ciphertext.length !== 0 && text.ciphertext.length !== CIPHERTEXT_LENGTH)))
              ? 'input-warning'
              : (textType === TextType.PLAINTEXT && text.plaintext.length === PLAINTEXT_LENGTH) ||
                (textType === TextType.CIPHERTEXT && text.ciphertext.length === CIPHERTEXT_LENGTH)
              ? 'input-success'
              : ''
            : ''
        }`}
        type="text"
        name=""
        id=""
        placeholder="Type here"
        // defaultValue={textType === TextType.PLAINTEXT ? text.plaintext : text.ciphertext}
        value={textType === TextType.PLAINTEXT ? text.plaintextRaw : text.ciphertext}
        onChange={handleTextInputOnChange}
        onBlur={() => setIsTextInputFocused(false)}
        onFocus={() => setIsTextInputFocused(true)}
      />
      <label className="label">
        <span className="label-text-alt">
          {(textType === TextType.PLAINTEXT && !text.isValidPlaintext) ||
          (textType === TextType.CIPHERTEXT && !text.isValidCiphertext)
            ? 'Invalid text'
            : textType === TextType.PLAINTEXT && text.plaintext.length <= PLAINTEXT_LENGTH
            ? `${PLAINTEXT_LENGTH - text.plaintext.length} characters left`
            : textType === TextType.PLAINTEXT
            ? `${text.plaintext.length - PLAINTEXT_LENGTH} characters over`
            : text.ciphertext.length <= CIPHERTEXT_LENGTH
            ? `${CIPHERTEXT_LENGTH - text.ciphertext.length} characters left`
            : `${text.ciphertext.length - CIPHERTEXT_LENGTH} characters over`}
        </span>
      </label>
    </>
  );
};

export default TextInput;
