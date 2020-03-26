enum Level {
  ERROR = 'ERROR',
  DEFAULT = 'DEFAULT',
  DEBUG = 'DEBUG',
}

export class Logging {
  readonly _log: Function;
  readonly _error: Function;
  readonly _debug: Function;
  readonly logLevel: Level;

  constructor(
    log: Function = cloudWatch(console.log),
    error: Function = cloudWatch(console.error),
    debug: Function = cloudWatch(console.info),
  ) {
    this._log = log;
    this._error = error;
    this._debug = debug;
    this.logLevel = (process.env.LOG_LEVEL || Level.DEFAULT) as Level;
  }

  static log = (...args: any[]): void => {
    new Logging().log(...args);
  };

  static error = (err: Error, ...args: any[]): void => {
    new Logging().error(err, ...args);
  };

  static debug = (...args: any[]): void => {
    new Logging().debug(...args);
  };

  log = (...args: any[]): void => {
    if (this.logLevel === Level.ERROR) {
      return;
    }
    this._log({ level: Level.DEFAULT, data: args });
  };

  debug = (...args: any[]): void => {
    if (this.logLevel !== Level.DEBUG) {
      return;
    }
    this._debug({ level: Level.DEBUG, data: args });
  };

  error = (err: Error, ...args: any[]): void => {
    this._error({
      level: Level.ERROR,
      errorMessage: err.message,
      stack: err.stack,
      error: err,
      data: args,
    });
  };
}

// AWS CloudWatch supports filtering by JSON properties, IF logging pure JSON objects as strings
const cloudWatch = (log: Function) => (logArg: any) => {
  log(JSON.stringify(logArg, null, 2));
};
