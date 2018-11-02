import { Logging } from '../src/logging';

describe('Logging', () => {
  describe('log()', () => {
    it('logs a call as a JSON object', done => {
      new Logging(({ level, data }: { level: string; data: any }) => {
        expect(level).toEqual('DEFAULT');
        expect(data).toEqual(['foo', 'bar']);
        done();
      }).log('foo', 'bar');
    });
  });
  describe('static log()', () => {
    it('logs a call as a stringified JSON object', () => {
      // @ts-ignore
      global.console = {
        log: jest.fn(),
      };
      Logging.log('foo', 'bar');
      expect(global.console.log).toHaveBeenCalledWith(
        JSON.stringify({ level: 'DEFAULT', data: ['foo', 'bar'] }, null, 2),
      );
    });
  });
  describe('error()', () => {
    it('logs a call as a JSON object', done => {
      const err = new Error('bar');
      new Logging(
        undefined,
        ({
          level,
          errorMessage,
          stack,
          error,
          data,
        }: {
          level: string;
          errorMessage: string;
          stack: string;
          error: Error;
          data: any;
        }) => {
          expect(level).toEqual('ERROR');
          expect(errorMessage).toEqual('bar');
          expect(stack).toContain('Error: bar');
          expect(error).toEqual(err);
          expect(data).toEqual(['foo']);
          done();
        },
      ).error(err, 'foo');
    });
  });
  describe('static error()', () => {
    it('logs a call as a stringified JSON object', () => {
      // The stack trace is going to be unique to each test env, so to implement this
      // test we have to capture the string passed to global.console.error, parse it,
      // check the stack property value, then remove the stack property and serialize
      // it back to compare with a stringified object that does not contain the stack.
      const err = new Error('bar');
      let calledWith: string = '';
      let calledWithObj: Error;

      // @ts-ignore
      global.console = {
        log: console.log,
        error: jest.fn((e: string) => {
          // capture the JSON string
          calledWith = e;
          return e;
        }),
      };
      Logging.error(err, 'foo', 'baz');
      // parse the error JSON so we can easily test the stack value
      calledWithObj = JSON.parse(calledWith);
      expect(calledWithObj.stack).toMatch(/Error:\sbar/);
      // delete the stack property because it's already been tested and we only need
      // to check the remaining properties.
      delete calledWithObj.stack;
      expect(JSON.stringify(calledWithObj, null, 2)).toEqual(
        JSON.stringify(
          {
            level: 'ERROR',
            errorMessage: 'bar',
            error: err,
            data: ['foo', 'baz'],
          },
          null,
          2,
        ),
      );
    });
  });
  describe('debug()', () => {
    it('logs a call as a JSON object', done => {
      new Logging(
        undefined,
        undefined,
        ({ level, data }: { level: string; data: any }) => {
          expect(level).toEqual('DEBUG');
          expect(data).toEqual(['foo']);
          done();
        },
      ).debug('foo');
    });
  });
  describe('static debug()', () => {
    it('logs a call as a stringified JSON object', () => {
      // @ts-ignore
      global.console = {
        info: jest.fn(),
      };
      Logging.debug('foo', 'bar');
      expect(global.console.info).toHaveBeenCalledWith(
        JSON.stringify({ level: 'DEBUG', data: ['foo', 'bar'] }, null, 2),
      );
    });
  });
});
