const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');

const _apacheBench = 'ab';
const _abArgs = ['-c', '100', '-n', '100', 'http://www.baidu.com'];
start();

function deepClone(obj) {
  var o = obj instanceof Array ? [] : {};
  for(var k in obj)
    o[k] = typeof obj[k] === Object ? deepClone(obj[k]) : obj[k];
  return o;
}

function exec(processToRun, args, cbObj) {
  var childProcess = spawn(processToRun, args);
  if (cbObj && cbObj.success) {
    childProcess.stdout.on('data', cbObj.success);
  }

  if (cbObj && cbObj.error) {
    childProcess.stderr.on('data', cbObj.error);
  }

  if (cbObj && cbObj.exit) {
    childProcess.on('data', cbObj.exit);
  }
}

function readConfig() {
  return require('./config.json');
}

function makeTasks(config) {
  const tasks = [];
  for (const serverKey in config.target) {
    for (const protocolKey in config.target[serverKey]) {
      config.resource.forEach((el, idx) => {
        const taskObj = {}, protocolObj = config.target[serverKey][protocolKey];
        taskObj.name = serverKey + '-' + protocolKey + '-' + el.split('.')[0];
        taskObj.url = protocolKey + '://' + protocolObj + el;
        tasks.push(taskObj);
      })
    }
  }
  return tasks;
}

function taskRunner(tasks) {
  if (!tasks) {
    return;
  }

  const nextTask = tasks.shift();
  const args = deepClone(_abArgs);
  args.push(nextTask.url);
  exec(_apacheBench, args, {
    success: (data) => {

    },
    fail: (data) => {

    },
    exit: (data) => {
      taskRunner(tasks);
    }
  })
}

function start() {
   // read config
   const config = readConfig();
   const tasks = makeTasks(config);
   taskRunner(tasks);

  //  exec(_apacheBench, _abArgs, {
  //    success: function(data) {console.log('success' + data)},
  //    error: function(data) {console.log('error' + data)},
  //    exit: function(data) {console.log('exit' + data)},
  //  })
}
