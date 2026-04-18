// ========== CommonJS 导入示例 ==========

// 解构导入
const { sum, Calculator } = require('./cjs-export');

console.log('sum(1, 2) =', sum(1, 2));
console.log('multiply(3, 4) =', new Calculator().calculate(3, 4, '*'));
