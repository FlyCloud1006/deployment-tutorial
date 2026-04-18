// ========== CommonJS 导出示例 ==========

// 命名导出（多个）
const sum = (a, b) => a + b;
const multiply = (a, b) => a * b;

// 默认导出（只能有一个）
class Calculator {
  calculate(a, b, op) {
    if (op === '+') return sum(a, b);
    if (op === '*') return multiply(a, b);
    throw new Error('Unknown operator: ' + op);
  }
}

module.exports = {
  sum,
  multiply,
  Calculator,
};
