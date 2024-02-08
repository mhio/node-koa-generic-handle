import { Writable } from 'node:stream'

export function mockPino(opts){
  const logger = {
    info: opts.info,
    child: () => logger,
    levels: { values: [ 'info'] }
  }
  return logger
}

export class MemoryStream extends Writable {
  logs = []
  _write(chunk, _, next){
    this.logs.push(JSON.parse(chunk.toString()))
    next()
  }
}