import CustomPropTypes from '../CustomPropTypes';
import React, { createRef } from 'react';

// secret is required to call validators directly
import secret from 'prop-types/lib/ReactPropTypesSecret';

function assertPasses(validator, props) {
  expect(
    validator(props, 'testprop', 'testcomponent', 'prop', '', secret),
  ).toBe(null);
}

function assertFails(validator, props) {
  expect(
    validator(props, 'testprop', 'testcomponent', 'prop', '', secret),
  ).toBeInstanceOf(Error);
}

describe('CustomPropTypes', () => {
  describe('ref', () => {
    // eslint-disable-next-line jest/expect-expect
    it('Passes on empty ref', () => {
      assertPasses(CustomPropTypes.ref, {
        testprop: createRef(),
      });
    });

    // eslint-disable-next-line jest/expect-expect
    it('Passes on element ref', () => {
      const ref = createRef();
      ref.current = <div />;
      assertPasses(CustomPropTypes.ref, {
        testprop: ref,
      });
    });

    // eslint-disable-next-line jest/expect-expect
    it('Fails on string', () => {
      assertFails(CustomPropTypes.ref, {
        testprop: 'somestring',
      });
    });

    // eslint-disable-next-line jest/expect-expect
    it('Fails on null if required', () => {
      assertFails(CustomPropTypes.ref.isRequired, {
        testprop: 'somestring',
      });
    });
  });

  describe('button', () => {
    it('Passes on proper value', () => {
      const buttonProp = {
        compact: true,
        disabled: true,
        text: 'tttt',
        label: 'llll',
        glyph: 'gggg',
      };
      const result = CustomPropTypes.button(
        {
          button: buttonProp,
        },

        'button',
        'David H',
      );

      expect(result).toBe(null);
    });

    it('Fails on empty value', () => {
      const buttonProp = {};
      const result = CustomPropTypes.button(
        {
          button: buttonProp,
        },

        'button',
        'David H',
      );

      expect(result).toBeInstanceOf(Error);
    });

    it('Passes when one of the props has wrong type', () => {
      const buttonProp = {
        compact: 'I should not be a string',
        disabled: true,
        text: 'tttt',
        label: 'llll',
        glyph: 'gggg',
      };
      const result = CustomPropTypes.button(
        {
          button: buttonProp,
        },

        'button',
        'David H',
      );

      expect(result).toBeInstanceOf(Error);
    });
  });
});
