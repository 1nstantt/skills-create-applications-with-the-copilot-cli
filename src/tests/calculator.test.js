const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { describe, test } = require("node:test");
const { calculate } = require("../calculator");

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

  test("rejects unsupported operations", () => {
    assert.throws(() => calculate("%", 5, 2), /supported operations/);
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

  test("reports invalid operands", () => {
    const result = spawnSync(process.execPath, [calculatorPath], {
      encoding: "utf8",
      input: "*\nnot-a-number\n2\n",
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /First number must be a finite number/);
  });
});
