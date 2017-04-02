/**
 * `onDisconnected` will be called when network disconneted
 * The script must be run in the console of `TEST_URL`
 */

function detectNetworkAccessibility({ TEST_URL, DETECT_INTERVAL = 30 * 1000, TIMEOUT = 3 * 1000 }, onDisconnected = alert) {
  const RETRY_INTERVAL = 5 * 1000;
  console.log(`Detecting network accessibility by fetching ${TEST_URL} at every ${DETECT_INTERVAL / 1000}s`);

  timeoutableFetch(fetch(TEST_URL), { TIMEOUT })
    .then(({ status, statusText }) => {
      console.log('%s %s', status, statusText);
      setTimeout(() => {
        detectNetworkAccessibility({ TEST_URL, DETECT_INTERVAL, TIMEOUT }, onDisconnected);
      }, DETECT_INTERVAL);
    })
    .catch((error) => {
      onDisconnected(error);
      console.info(`The script will re-detect after ${RETRY_INTERVAL / 1000}s`);
      
      setTimeout(() => {
        detectNetworkAccessibility({ TEST_URL, DETECT_INTERVAL, TIMEOUT }, onDisconnected);
      }, RETRY_INTERVAL);
    });
}

function timeoutableFetch(fetchPromise, { TIMEOUT }) {
  let abort = null;

  const abortPromise = new Promise((resolve, reject) => {
    abort = (msg) => { reject(msg); };
  });

  const abortablePromise = Promise.race([fetchPromise, abortPromise]);

  if (TIMEOUT) {
    setTimeout(() => {
      abort(`NET_TIME_OUT after ${TIMEOUT / 1000}s`);
    }, TIMEOUT);
  }

  return abortablePromise;
}

detectNetworkAccessibility({ TEST_URL: 'https://www.baidu.com/' });
