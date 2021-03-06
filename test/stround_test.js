var expect = require('expect.js');

var stround;
if (process.env.TEST_MODE) {
  stround = require('../dist/stround.'+process.env.TEST_MODE);
} else {
  stround = require('../dist/stround');
}

var round = stround.round;
var modes = stround.modes;
var shift = stround.shift;
var shiftParts = stround.shiftParts;

describe('round', function() {
  it('accepts strings', function() {
    expect(round('123.45')).to.be('123');
  });

  it('accepts numbers', function() {
    expect(round(123.45)).to.be('123');
  });

  it('does not interpret an empty string and simply returns it', function() {
    expect(round('')).to.be('');
  });

  it('uses half-even rounding and zero precision by default', function() {
    expect(round('2.5')).to.be('2');
    expect(round('3.5')).to.be('4');
  });

  it('throws when given a malformed number', function() {
    expect(function(){ round('1.1.1'); })
      .to.throwError(/cannot round malformed number: 1\.1\.1/);
    expect(function(){ round(undefined); })
      .to.throwError(/expected a string or number, got: undefined/);
    expect(function(){ round('hey'); })
      .to.throwError(/cannot round malformed number: hey/);
  });

  it('handles special numbers correctly', function() {
    expect(round('NaN')).to.be('NaN');
    expect(round('Infinity')).to.be('Infinity');
    expect(round('-Infinity')).to.be('-Infinity');
  });
});

describe('round (ceiling)', function() {
  it('leaves integers as-is', function() {
    expect(round('4', 0, modes.CEILING)).to.be('4');
    expect(round('-4', 0, modes.CEILING)).to.be('-4');
    expect(round('4.000000', 0, modes.CEILING)).to.be('4');
  });

  it('rounds toward positive infinity', function() {
    expect(round('4.0000001', 0, modes.CEILING)).to.be('5');
    expect(round('-4.9999999', 0, modes.CEILING)).to.be('-4');
    expect(round('0.0000000000000000000000001', 0, modes.CEILING)).to.be('1');
  });

  it('rounds with a specific precision', function() {
    expect(round('4', 2, modes.CEILING)).to.be('4.00');
    expect(round('4.00003', 2, modes.CEILING)).to.be('4.01');
    expect(round('9.901', 1, modes.CEILING)).to.be('10.0');
  });

  it('works with very large numbers', function() {
    expect(round('999999999999999999999999999.9', 0, modes.CEILING)).to.be('1000000000000000000000000000');
  });
});

describe('round (floor)', function() {
  it('leaves integers as-is', function() {
    expect(round('4', 0, modes.FLOOR)).to.be('4');
    expect(round('-4', 0, modes.FLOOR)).to.be('-4');
    expect(round('4.000000', 0, modes.FLOOR)).to.be('4');
  });

  it('rounds toward negative infinity', function() {
    expect(round('4.9999999', 0, modes.FLOOR)).to.be('4');
    expect(round('-4.0000001', 0, modes.FLOOR)).to.be('-5');
    expect(round('0.999999999999999999999999999', 0, modes.FLOOR)).to.be('0');
  });

  it('rounds with a specific precision', function() {
    expect(round('4', 2, modes.FLOOR)).to.be('4.00');
    expect(round('4.01999', 2, modes.FLOOR)).to.be('4.01');
    expect(round('-9.901', 1, modes.FLOOR)).to.be('-10.0');
  });

  it('works with very large numbers', function() {
    expect(round('999999999999999999999999999.9', 0, modes.FLOOR)).to.be('999999999999999999999999999');
  });
});

describe('round (down)', function() {
  it('leaves integers as-is', function() {
    expect(round('4', 0, modes.DOWN)).to.be('4');
    expect(round('-4', 0, modes.DOWN)).to.be('-4');
    expect(round('4.000000', 0, modes.DOWN)).to.be('4');
  });

  it('rounds toward zero', function() {
    expect(round('4.9999999', 0, modes.DOWN)).to.be('4');
    expect(round('-4.0000001', 0, modes.DOWN)).to.be('-4');
    expect(round('0.999999999999999999999999999', 0, modes.DOWN)).to.be('0');
  });

  it('rounds with a specific precision', function() {
    expect(round('4', 2, modes.DOWN)).to.be('4.00');
    expect(round('4.01999', 2, modes.DOWN)).to.be('4.01');
    expect(round('-9.901', 1, modes.DOWN)).to.be('-9.9');
  });

  it('works with very large numbers', function() {
    expect(round('999999999999999999999999999.9', 0, modes.DOWN)).to.be('999999999999999999999999999');
  });
});

describe('round (up)', function() {
  it('leaves integers as-is', function() {
    expect(round('4', 0, modes.UP)).to.be('4');
    expect(round('-4', 0, modes.UP)).to.be('-4');
    expect(round('4.000000', 0, modes.UP)).to.be('4');
  });

  it('rounds away from zero', function() {
    expect(round('4.9999999', 0, modes.UP)).to.be('5');
    expect(round('-4.0000001', 0, modes.UP)).to.be('-5');
    expect(round('0.999999999999999999999999999', 0, modes.UP)).to.be('1');
  });

  it('rounds with a specific precision', function() {
    expect(round('4', 2, modes.UP)).to.be('4.00');
    expect(round('4.01999', 2, modes.UP)).to.be('4.02');
    expect(round('-9.901', 1, modes.UP)).to.be('-10.0');
  });

  it('works with very large numbers', function() {
    expect(round('999999999999999999999999999.9', 0, modes.UP)).to.be('1000000000000000000000000000');
  });
});

describe('round (half-even)', function() {
  it('leaves integers as-is', function() {
    expect(round('4', 0, modes.HALF_EVEN)).to.be('4');
    expect(round('-4', 0, modes.HALF_EVEN)).to.be('-4');
    expect(round('4.000000', 0, modes.HALF_EVEN)).to.be('4');
  });

  it('rounds toward nearest integer or even if equidistant', function() {
    expect(round('4.4', 0, modes.HALF_EVEN)).to.be('4');
    expect(round('4.5', 0, modes.HALF_EVEN)).to.be('4');
    expect(round('4.50000000000000000001', 0, modes.HALF_EVEN)).to.be('5');
    expect(round('5.5', 0, modes.HALF_EVEN)).to.be('6');
    expect(round('5.6', 0, modes.HALF_EVEN)).to.be('6');
    expect(round('-4.4', 0, modes.HALF_EVEN)).to.be('-4');
    expect(round('-4.5', 0, modes.HALF_EVEN)).to.be('-4');
    expect(round('-4.50000000000000000001', 0, modes.HALF_EVEN)).to.be('-5');
    expect(round('-5.5', 0, modes.HALF_EVEN)).to.be('-6');
    expect(round('-5.6', 0, modes.HALF_EVEN)).to.be('-6');
  });

  it('rounds with a specific precision', function() {
    expect(round('4', 2, modes.HALF_EVEN)).to.be('4.00');
    expect(round('4.015', 2, modes.HALF_EVEN)).to.be('4.02');
    expect(round('4.025', 2, modes.HALF_EVEN)).to.be('4.02');
    expect(round('-4.015', 2, modes.HALF_EVEN)).to.be('-4.02');
    expect(round('-4.025', 2, modes.HALF_EVEN)).to.be('-4.02');
  });

  it('works with very large numbers', function() {
    expect(round('999999999999999999999999999.5', 0, modes.HALF_EVEN)).to.be('1000000000000000000000000000');
  });
});

describe('round (half-down)', function() {
  it('leaves integers as-is', function() {
    expect(round('4', 0, modes.HALF_DOWN)).to.be('4');
    expect(round('-4', 0, modes.HALF_DOWN)).to.be('-4');
    expect(round('4.000000', 0, modes.HALF_DOWN)).to.be('4');
  });

  it('rounds toward nearest integer or zero if equidistant', function() {
    expect(round('4.4', 0, modes.HALF_DOWN)).to.be('4');
    expect(round('4.5', 0, modes.HALF_DOWN)).to.be('4');
    expect(round('4.50000000000000000001', 0, modes.HALF_DOWN)).to.be('5');
    expect(round('5.5', 0, modes.HALF_DOWN)).to.be('5');
    expect(round('5.6', 0, modes.HALF_DOWN)).to.be('6');
    expect(round('-4.4', 0, modes.HALF_DOWN)).to.be('-4');
    expect(round('-4.5', 0, modes.HALF_DOWN)).to.be('-4');
    expect(round('-4.50000000000000000001', 0, modes.HALF_DOWN)).to.be('-5');
    expect(round('-5.5', 0, modes.HALF_DOWN)).to.be('-5');
    expect(round('-5.6', 0, modes.HALF_DOWN)).to.be('-6');
  });

  it('rounds with a specific precision', function() {
    expect(round('4', 2, modes.HALF_DOWN)).to.be('4.00');
    expect(round('4.015', 2, modes.HALF_DOWN)).to.be('4.01');
    expect(round('4.025', 2, modes.HALF_DOWN)).to.be('4.02');
    expect(round('-4.015', 2, modes.HALF_DOWN)).to.be('-4.01');
    expect(round('-4.025', 2, modes.HALF_DOWN)).to.be('-4.02');
  });

  it('works with very large numbers', function() {
    expect(round('999999999999999999999999999.5', 0, modes.HALF_DOWN)).to.be('999999999999999999999999999');
  });
});

describe('round (half-up)', function() {
  it('leaves integers as-is', function() {
    expect(round('4', 0, modes.HALF_UP)).to.be('4');
    expect(round('-4', 0, modes.HALF_UP)).to.be('-4');
    expect(round('4.000000', 0, modes.HALF_UP)).to.be('4');
  });

  it('rounds toward nearest integer or away from zero if equidistant', function() {
    expect(round('4.4', 0, modes.HALF_UP)).to.be('4');
    expect(round('4.5', 0, modes.HALF_UP)).to.be('5');
    expect(round('4.50000000000000000001', 0, modes.HALF_UP)).to.be('5');
    expect(round('5.5', 0, modes.HALF_UP)).to.be('6');
    expect(round('5.6', 0, modes.HALF_UP)).to.be('6');
    expect(round('-4.4', 0, modes.HALF_UP)).to.be('-4');
    expect(round('-4.5', 0, modes.HALF_UP)).to.be('-5');
    expect(round('-4.50000000000000000001', 0, modes.HALF_UP)).to.be('-5');
    expect(round('-5.5', 0, modes.HALF_UP)).to.be('-6');
    expect(round('-5.6', 0, modes.HALF_UP)).to.be('-6');
  });

  it('rounds with a specific precision', function() {
    expect(round('4', 2, modes.HALF_UP)).to.be('4.00');
    expect(round('4.015', 2, modes.HALF_UP)).to.be('4.02');
    expect(round('4.025', 2, modes.HALF_UP)).to.be('4.03');
    expect(round('-4.015', 2, modes.HALF_UP)).to.be('-4.02');
    expect(round('-4.025', 2, modes.HALF_UP)).to.be('-4.03');
  });

  it('works with very large numbers', function() {
    expect(round('999999999999999999999999999.5', 0, modes.HALF_UP)).to.be('1000000000000000000000000000');
  });
});

describe('shift', function() {
  it('leaves values alone when shifting by zero', function() {
    expect(shift('12', 0)).to.be('12');
    expect(shift(12, 0)).to.be('12');
  });

  it('pads the right with zeros given an integer', function() {
    expect(shift('847', 4)).to.be('8470000');
  });

  it('moves fractional digits over to the integer side', function() {
    expect(shift('12.34', 2)).to.be('1234');
  });

  it('leaves a fractional part if it is not entirely shifted off', function() {
    expect(shift('12.34', 1)).to.be('123.4');
  });

  it('handles negative numbers correctly', function() {
    expect(shift('-5.987', 5)).to.be('-598700');
  });

  it('handles negative exponents correctly', function() {
    expect(shift('12', -2)).to.be('0.12');
  });

  it('round-trips correctly', function() {
    expect(shift(shift('12345.678900', 4), -4)).to.be('12345.678900');
    expect(shift(shift('1', -4), 4)).to.be('1');
  });

  it('handles special numbers correctly', function() {
    expect(shift('Infinity', 1)).to.be('Infinity');
    expect(shift('-Infinity', 1)).to.be('-Infinity');
    expect(shift('NaN', 1)).to.be('NaN');
  });
});

describe('shiftParts', function() {
  it('works like shift but with arrays', function() {
    expect(shiftParts([true, '12', '34'], 2)).to.eql([true, '1234', '']);
  });
});
