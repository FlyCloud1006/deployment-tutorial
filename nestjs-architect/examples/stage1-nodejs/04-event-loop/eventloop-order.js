// ========== 事件循环顺序完整演示 ==========

console.log('【同步1】script start');

setTimeout(() => {
  console.log('【宏任务】setTimeout 1');
  Promise.resolve().then(() => console.log('【微任务】setTimeout 内部 Promise'));
}, 0);

setTimeout(() => {
  console.log('【宏任务】setTimeout 2');
}, 0);

Promise.resolve().then(() => console.log('【微任务】Promise 1'));
Promise.resolve().then(() => console.log('【微任务】Promise 2'));
Promise.resolve().then(() => {
  console.log('【微任务】Promise 3');
  process.nextTick(() => console.log('【特殊微任务】nextTick 在 Promise 内部'));
});

process.nextTick(() => console.log('【特殊微任务】nextTick 1'));
process.nextTick(() => console.log('【特殊微任务】nextTick 2'));

console.log('【同步2】script end');
