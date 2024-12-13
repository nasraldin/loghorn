import { HttpHeaderName, HttpRequestMethodName } from '@constants';
import { env } from '@environment';

import { LogEntry } from './log-entry';

/**
 * Logging Rest/Web API Class
 */
export class LogSeq {
  async log(entry: LogEntry) {
    if (env.NEXT_PUBLIC_SEQ_LOGS) {
      await fetch(env.NEXT_PUBLIC_SEQ_URL, {
        method: HttpRequestMethodName.POST,
        headers: { [HttpHeaderName.ContentType]: '' },
        body: JSON.stringify({ events: [entry.buildLog()] }),
      }).catch(this.handleErrors);
    }
  }

  private handleErrors(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('LogSeq:: An error occurred', { error });
    return error;
  }
}
