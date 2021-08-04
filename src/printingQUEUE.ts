import {
  NativeModules,
  EmitterSubscription,
  NativeEventEmitter,
} from 'react-native';

// import lineWrap from 'word-wrap';
// import {
//   PRINTING_ALIGNMENT,
//   PRINTING_COMMANDS,
//   EPOS_BOOLEANS,
// } from 'react-native-esc-pos-printer/src/constants';
import type { IMonitorStatus } from './types';
// import { BufferHelper } from 'react-native-esc-pos-printer/src/utils/BufferHelper';

const { EscPosPrinter } = NativeModules;
const printEventEmmiter = new NativeEventEmitter(EscPosPrinter);

// type TCommandValue = [string, any[]];
// type TScalingFactors = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Create an array of commands to send to the printer
 */
class PrintingQUEUE {
  /**
   * Create a new object
   *
   */
  constructor() {}

  /**
   * Send the current array of commands to the printer
   *
   * @param  {string}   value  String to encode
   * @return {object}          Encoded string as a ArrayBuffer
   *
   */
  _send(commands: any[]): Promise<IMonitorStatus> {
    let successListener: EmitterSubscription | null;
    let errorListener: EmitterSubscription | null;

    function removeListeners() {
      successListener?.remove();
      errorListener?.remove();

      successListener = null;
      errorListener = null;
    }

    return new Promise((res, rej) => {
      successListener = printEventEmmiter.addListener(
        'onPrintSuccess',
        (status) => {
          removeListeners();
          res(status);
        }
      );

      errorListener = printEventEmmiter.addListener(
        'onPrintFailure',
        (status) => {
          removeListeners();
          rej(status);
        }
      );

      EscPosPrinter.printQUEUE(commands).catch((e: Error) => {
        removeListeners();
        rej(e);
      });
    });
  }

  /**
   * Initialize the printer
   *
   * @return {object}          Return the object, for easy chaining commands
   *
   */
  initialize() {
    // this._reset();

    return this;
  }

  send(commands: any[]) {
    return this._send(commands);
  }
}

export default PrintingQUEUE;
