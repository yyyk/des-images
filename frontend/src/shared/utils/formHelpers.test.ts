import { destructDateInputValue } from 'src/shared/utils/formHelpers';

describe('formHelpers', function () {
  describe('destructDateInputValue', function () {
    it('deconstructs date input value', function () {
      expect(destructDateInputValue('2020-1-1')).toStrictEqual({
        year: '2020',
        month: '01',
        day: '01',
      });
    });
  });
});
