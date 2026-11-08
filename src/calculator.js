const { createInterface } = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

function modulo(a, b) {
  if (b === 0) {
    throw new Error("Cannot take modulo by zero.");
  }

  return a % b;
}

function power(base, exponent) {
  return base ** exponent;
}

function squareRoot(n) {
  if (n < 0) {
    throw new Error("Cannot calculate the square root of a negative number.");
  }

  return Math.sqrt(n);
}

// Supported CLI operations: +, -, *, /, %, ^, and sqrt.
const operations = {
  "+": (left, right) => left + right,
  "-": (left, right) => left - right,
  "*": (left, right) => left * right,
  "/": (left, right) => {
    if (right === 0) {
      throw new Error("Cannot divide by zero.");
    }

    return left / right;
  },
  "%": modulo,
  "^": power,
};

function calculate(operation, left, right) {
  if (!Object.hasOwn(operations, operation)) {
    throw new Error("Choose one of the supported operations: +, -, *, /, %, ^.");
  }

  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    throw new Error("Both operands must be finite numbers.");
  }

  return operations[operation](left, right);
}

function parseOperand(value, name) {
  if (value.trim() === "") {
    throw new Error(`${name} must be a number.`);
  }

  const operand = Number(value);
  if (!Number.isFinite(operand)) {
    throw new Error(`${name} must be a finite number.`);
  }

  return operand;
}

async function main() {
  const terminal = createInterface({ input: stdin, output: stdout });
  const lines = terminal[Symbol.asyncIterator]();

  async function ask(prompt) {
    stdout.write(prompt);
    const { value, done } = await lines.next();
    if (done) {
      throw new Error("Input ended before all values were provided.");
    }

    return value;
  }

  try {
    console.log("CLI Calculator (+, -, *, /, %, ^, sqrt)");
    const operation = (await ask("Operation (+, -, *, /, %, ^, sqrt): ")).trim();
    const first = parseOperand(
      await ask(operation === "sqrt" ? "Number: " : "First number: "),
      operation === "sqrt" ? "Number" : "First number",
    );
    const result =
      operation === "sqrt"
        ? squareRoot(first)
        : calculate(
            operation,
            first,
            parseOperand(await ask("Second number: "), "Second number"),
          );

    console.log(`Result: ${result}`);
  } finally {
    terminal.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { calculate, modulo, power, squareRoot };
