const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { describe, test } = require("node:test");
const { calculate, modulo, power, squareRoot } = require("../calculator");

describe("calculate", () => {
  describe("image examples", () => {
    test("adds 2 + 3", () => {
      assert.equal(calculate("+", 2, 3), 5);
    });

    test("subtracts 10 - 4", () => {
      assert.equal(calculate("-", 10, 4), 6);
    });

    test("multiplies 45 * 2", () => {
      assert.equal(calculate("*", 45, 2), 90);
    });

    test("divides 20 / 5", () => {
      assert.equal(calculate("/", 20, 5), 4);
    });

    test("calculates 5 modulo 2", () => {
      assert.equal(calculate("%", 5, 2), 1);
    });

    test("raises 2 to the power of 3", () => {
      assert.equal(calculate("^", 2, 3), 8);
    });
  });

  test("supports decimal operands", () => {
    assert.equal(calculate("+", 1.5, 2.25), 3.75);
    assert.equal(calculate("-", 5.5, 2.25), 3.25);
    assert.equal(calculate("*", 1.5, 2.5), 3.75);
    assert.equal(calculate("/", 7.5, 2.5), 3);
  });

  test("supports negative operands and results", () => {
    assert.equal(calculate("+", -2, 3), 1);
    assert.equal(calculate("-", 3, 5), -2);
    assert.equal(calculate("*", -4, 2), -8);
    assert.equal(calculate("/", 8, -2), -4);
  });

  test("supports zero operands", () => {
    assert.equal(calculate("+", 0, 0), 0);
    assert.equal(calculate("*", 0, 10), 0);
    assert.equal(calculate("/", 0, 10), 0);
  });

  test("rejects division by zero", () => {
    assert.throws(() => calculate("/", 1, 0), /Cannot divide by zero/);
    assert.throws(() => calculate("/", 1, -0), /Cannot divide by zero/);
  });

  test("handles modulo edge cases", () => {
    assert.equal(modulo(10, 3), 1);
    assert.equal(modulo(-5, 2), -1);
    assert.throws(() => modulo(10, 0), /Cannot take modulo by zero/);
  });

  test("handles power with zero and negative exponents", () => {
    assert.equal(power(2, 4), 16);
    assert.equal(power(2, 0), 1);
    assert.equal(power(2, -2), 0.25);
  });

  test("rejects square roots of negative numbers", () => {
    assert.equal(squareRoot(16), 4);
    assert.throws(() => squareRoot(-1), /square root of a negative number/);
  });

  test("rejects unsupported operations", () => {
    assert.throws(() => calculate("?", 5, 2), /supported operations/);
  });

  test("rejects non-finite or non-number operands", () => {
    for (const invalid of [NaN, Infinity, -Infinity, "2"]) {
      assert.throws(() => calculate("+", invalid, 1), /finite numbers/);
      assert.throws(() => calculate("+", 1, invalid), /finite numbers/);
    }
  });
});

describe("calculator CLI", () => {
  const calculatorPath = path.join(__dirname, "..", "calculator.js");

  test("calculates decimal operands from standard input", () => {
    const result = spawnSync(process.execPath, [calculatorPath], {
      encoding: "utf8",
      input: "+\n1.5\n2.25\n",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Result: 3\.75/);
  });

  test("calculates modulo from standard input", () => {
    const result = spawnSync(process.execPath, [calculatorPath], {
      encoding: "utf8",
      input: "%\n5\n2\n",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Result: 1/);
  });

  test("calculates a power from standard input", () => {
    const result = spawnSync(process.execPath, [calculatorPath], {
      encoding: "utf8",
      input: "^\n2\n3\n",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Result: 8/);
  });

  test("calculates a square root from standard input", () => {
    const result = spawnSync(process.execPath, [calculatorPath], {
      encoding: "utf8",
      input: "sqrt\n16\n",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Result: 4/);
  });

  test("reports a negative square root from standard input", () => {
    const result = spawnSync(process.execPath, [calculatorPath], {
      encoding: "utf8",
      input: "sqrt\n-1\n",
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /square root of a negative number/);
  });

  test("reports invalid operands", () => {
    const result = spawnSync(process.execPath, [calculatorPath], {
      encoding: "utf8",
      input: "*\nnot-a-number\n2\n",
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /First number must be a finite number/);
  });
});
