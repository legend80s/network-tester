/**
 * Console with customized header which can be static or dynamic
 *
 * @example
 * // static header
 * const console = myConsole({ header: '[OpenSearch]' });
 * console.log('App Type is %s', 'Advance'); // Output: "[OpenSearch] App type is Advance"
 *
 * // dynamic heade, current executed time
 * const console = myConsole({ header: () => `[${new Date().toLocaleString()}]` });
 * console.log('App Type is %s', 'Advance'); // Output: "[3/21/2017, 11:28:20 AM] App type is Advance"
 *
 * @param  {String | Function} options.header   Usually marked as the source of the log, header can be static if string is passed, or dynamic if header is a function
 * 
 * @param  {String} options.separator Separator between header and log body
 *
 * @return {Function}
 */

const nativeConsole = console;

module.exports = function myConsole({ header = '', separator = ' ' }) {
  function makeArgs(args) {
    const [arg0, ...otherArgs] = args;
    const headerString = typeof header === 'function' ? header() : header;

    return [`${headerString}${separator}${arg0}`, ...otherArgs];
  }

  return {
    log(...args) {
      nativeConsole.log(...makeArgs(args));
    },

    info(...args) {
      nativeConsole.info(...makeArgs(args));
    },

    error(...args) {
      nativeConsole.error(...makeArgs(args));
    },
  };
};
