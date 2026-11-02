import { SseEvent } from '../interfaces/primilla';
export declare function readSseEvents(stream: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent>;
