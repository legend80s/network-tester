/**
 * Reconnect to you network while it's down
 * Modify the file `preferences.json` to adjust to your preferences
 *
 * Usage:
 * node index --test-url https://www.baidu.com --timeout 3000 --test-interval 5000
 * node index -u https://www.baidu.com -t 3000 --i 5000
 */

const http = require('http');
const url = require('url');
const execSync = require('child_process').execSync;
const program = require('commander');

const myConsole = require('./lib/myConsole');

const console = myConsole({ header: () => `[${new Date().toLocaleString()}]` });

/**
 * @callback onDisconnected
 * @param {string} message Disconnected error message
 */

/**
 * Test network accessibility and onDisconnected called when it's disconnected
 *
 * @param  {string} options.TEST_URL       Url to test for network accessibility
 * @param  {number} options.TEST_INTERVAL  Test interval
 * @param  {number} options.TIMEOUT        Network considered to be disconnected After receive no response for timeout milliseconds
 * @param  {onDisconnected} options.onDisconnected Callback when network is disconnected
 */
function testNetworkAccessibility({ TEST_URL, TEST_INTERVAL = 30 * 1000, TIMEOUT = 2 * 1000, onDisconnected = console.log }) {
  const RETRY_INTERVAL = 5 * 1000;
  console.log(`Testing network accessibility by fetching ${TEST_URL} at every ${TEST_INTERVAL / 1000}s with timeout ${TIMEOUT / 1000}s`);

  const urlObject = url.parse(TEST_URL);

  const request = http.get({
    host: urlObject.host,
    protocal: urlObject.protocal,
  }, (response) => {
    console.info(`${response.statusCode} ${response.statusMessage}`);

    setTimeout(() => {
      testNetworkAccessibility({ TEST_URL, TEST_INTERVAL, TIMEOUT, onDisconnected });
    }, TEST_INTERVAL);
  });

  request.setTimeout(Number(TIMEOUT), () => {
    handler({ message: `TIMEOUT after ${TIMEOUT / 1000}s` });
  });

  request.on('error', handler);

  function handler(error) {
    onDisconnected(error.message);
    console.info(`Re-test after ${RETRY_INTERVAL / 1000}s`);

    setTimeout(() => {
      testNetworkAccessibility({ TEST_URL, TEST_INTERVAL, TIMEOUT, onDisconnected });
    }, RETRY_INTERVAL);
  }
}

/**
 * Reconnect to the netWork
 *
 * @param  {string} message Error message
 */
function reconnect(message) {
  console.error(`Error: ${message}`);
  console.info('Start reconnecting');

  execSync('networksetup -setairportpower en0 off');
  execSync('networksetup -setairportpower en0 on');

  console.info('Network connected');
}

/**
 * Entry function
 */
function main() {
  program
    .version('1.0.0')
    .option('-u, --test-url <url>', 'Url for test network accessibility')
    .option('-t, --timeout <timeout>', 'Network considered to be disconnected After receive no response for timeout milliseconds')
    .option('-i, --test-interval <interval>', 'Test interval')
    .parse(process.argv);

  testNetworkAccessibility({
    TEST_URL: program.testUrl || 'https://www.baidu.com',
    TEST_INTERVAL: program.testInterval,
    TIMEOUT: program.timeout,

    onDisconnected: reconnect,
  });
}

main();
