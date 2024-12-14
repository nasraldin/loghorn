import { seqUrl, writeLogsToSeq } from '../constants';
import { LogEntry } from './log-entry';

/**
 * Seq logging
 */
export class SeqLog {
  async log(entry: LogEntry) {
    if (writeLogsToSeq) {
      await fetch(seqUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [entry.buildLog()] }),
      }).catch(this.handleErrors);
    }
  }

  private handleErrors(error: unknown) {
    console.error('LogSeq:: An error occurred', { error });
    return error;
  }
}
