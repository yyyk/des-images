/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import { render, screen } from '@testing-library/react';
import DesImageSvg from '.';

describe('<DesImageSvg>', function () {
  const date = '20200101';
  const ciphertext = '0x79030f7920aaa3cfbbd92afbb93e70ba';
  const fills = [
    '#797979',
    '#030303',
    '#0f0f0f',
    '#797979',
    '#202020',
    '#aaaaaa',
    '#a3a3a3',
    '#cfcfcf',
    '#bbbbbb',
    '#d9d9d9',
    '#2a2a2a',
    '#fbfbfb',
    '#b9b9b9',
    '#3e3e3e',
    '#707070',
    '#bababa',
  ];

  it('has title tag', () => {
    render(<DesImageSvg date={date} ciphertext={ciphertext} />);
    expect(screen.getByTitle(`desImages${date}`)).toBeInTheDocument();
  });

  it('has 16 rect tags with fill set based on ciphertext', function () {
    const view = render(<DesImageSvg date={date} ciphertext={ciphertext} />);
    const rects = view.container.getElementsByTagName('rect');
    expect(rects).toHaveLength(16);

    for (let i = 0; i < 16; i++) {
      expect(rects[i].getAttribute('fill')).toEqual(fills[i]);
    }
  });
});
