// ========== async/await 示例 ==========

const fs = require('fs').promises;

async function processUserData() {
  try {
    // 串行：等上一个完成再下一个
    const userData = await fs.readFile('./user.json', 'utf8');
    const user = JSON.parse(userData);

    // 并行：两个文件同时读取
    const [orderData, configData] = await Promise.all([
      fs.readFile(`./orders-${user.id}.json`, 'utf8').catch(() => '{}'),
      fs.readFile('./config.json', 'utf8').catch(() => '{}'),
    ]);

    const orders = JSON.parse(orderData);

    // 写入结果
    await fs.writeFile('./result.json', JSON.stringify({ user, orders }));
    console.log('处理完成!');
  } catch (err) {
    console.error('处理失败:', err);
    throw err;
  }
}

processUserData();
