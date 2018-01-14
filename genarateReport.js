// var rd = require('rd');
const fs = require('fs');
const csv = require('csv');
const path = require('path');

const result = {};

const _file = '8cpu-report';
const _targetArray = ['Time taken for tests', 'Requests per second', 'Transfer rate'];

const filter = (str) => {
  if (_targetArray.indexOf(str) > -1) {
    return true;
  }
  return false;
}

function stringify(data, output) {
  csv.stringify(data, function(err, data) {
    fs.writeFile(output, data)
  });
}

function read() {
  const reportPath = path.resolve(__dirname, _file);
  const files = fs.readdirSync(reportPath);

  files.map((v, k) => {
    if (v.indexOf('.') === 0) return;
    const childFilePath = path.resolve(reportPath, v);

    // read chile dir
    const childFileList = fs.readdirSync(childFilePath);

    childFileList.map((fileName) => {
      if (v.indexOf('.') === 0) return;
      const tPath = path.resolve(childFilePath, fileName);
      const contentArray = fs.readFileSync(tPath).toString().split('\n');
      contentArray.map((v, k) => {
        const contentArray = v.split(':');
        // 非filter内容，直接返回
        if (!filter(contentArray[0])) return;

        const amount = contentArray[1].trim().split(' ')[0];
        const rowKey = fileName.split('.')[0];
        if (!result[rowKey]) result[rowKey] = [];
        result[rowKey].push(amount);
      })
    })
  });

  return result;
}

const merge = (content) => {
  const data = [];
  const keys = Object.keys(content);
  const headLength = content[keys[0]].length;
  let head = ['type'];

  for (let i = 0; i < headLength / _targetArray.length; i++) {
    head = head.concat(head, _targetArray);
    console.log(head)
  }

  data.push(head);

  keys.map((v) => {
    content[v].unshift(v);
    data.push(content[v]);
  });

  return data;
}

const content = read();

const data = merge(content)

stringify(data, './report.csv');
