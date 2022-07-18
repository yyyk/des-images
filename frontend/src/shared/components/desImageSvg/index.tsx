interface DesImageSvgProps {
  date: string;
  ciphertext: string;
}

const DesImageSvg = ({ ciphertext, date }: DesImageSvgProps) => {
  const hex = ciphertext.replace(/^0x/, '');
  const hexArr: string[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    hexArr.push(`${hex.charAt(i)}${hex.charAt(i + 1)}`);
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 128 128">
      <title>{`desImages${date}`}</title>
      {hexArr.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={i * 6}
          width={8 * (16 - i)}
          height={8 * (16 - i)}
          fill={`#${h}${h}${h}`}
          stroke="none"
        />
      ))}
    </svg>
  );
};

export default DesImageSvg;
