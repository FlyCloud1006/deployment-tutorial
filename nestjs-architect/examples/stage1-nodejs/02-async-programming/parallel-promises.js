// ========== Promise.all 并行示例 ==========

const fs = require('fs').promises;

async function fetchAllData(userId) {
  const start = Date.now();

  // 三个操作互不依赖，并行执行
  const [userData, orderData, configData] = await Promise.all([
    new Promise(resolve => setTimeout(() => resolve({ id: userId, name: '张三' }), 500)),
    fs.readFile('./config.json', 'utf8').catch(() => '{}'),
    new Promise((resolve, reject) => {
      require('https')
        .get('https://api.example.com/config', res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        })
        .on('error', reject);
    }),
  ]);

  console.log(`并行耗时: ${Date.now() - start}ms`);
  return { user: userData, orders: JSON.parse(orderData), config: configData };
}

// 对比：串行执行
async function fetchAllDataSerial(userId) {
  const start = Date.now();
  const user = await new Promise(r => setTimeout(() => r({ id: userId }), 500));
  const orders = await new Promise(r => setTimeout(() => r([]), 300));
  const config = await new Promise(r => setTimeout(() => r('{}'), 800));
  console.log(`串行耗时: ${Date.now() - start}ms`);
  return { user, orders, config };
}

fetchAllData(1).then(r => console.log('结果:', r));
