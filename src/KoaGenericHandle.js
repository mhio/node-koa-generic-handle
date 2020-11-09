const debug = require('debug')('mh:KoaGenericHandle')
const base62 = require('base62-random')
const Flatted = require('flatted')

/** 
  Handle API requests and errors in Koa apps in a standard way. 
*/
class KoaGenericHandle {

  /**
   * @summary Request tracking

   * @descrtracking
   * @description `.tracking` provides a request and transaction ID's and a response time header.
   *              Attaches `request_id`, `trasaction_id`, `request_start`, `request_total`, to `ctx.state`
   * @param {object}         options                        - The options for the logger  
   * @param {boolean|string} options.transaction_trust      - Trust the clients `x-transaction-id` header. (true/false/'ip')
   * @param {array}          options.transaction_trust_ips  - List of IP's to trust the clients `x-transaction-id` header from.
   *                                                          e.g. localhosts are `['::ffff:127.0.0.1', '127.0.0.1', '::1']`
   */
  static tracking(options){
    let tx_trust = false
    if ( options ) {
      if ( options.transaction_trust === true ) {
        tx_trust = true
      }
      if ( options.transaction_trust === 'ip' ) {
        if (!options.transaction_trust_ips) {
          throw new Error('transaction_trust `ip` must have a list of ips')
        }
        if (!options.transaction_trust_ips.includes) {
          throw new Error('transaction_trust_ips must support `.includes`')
        }
        tx_trust = function checkTransactionTrust(ctx){
          debug(ctx.request.ip)
          if ( options.transaction_trust_ips.includes(ctx.request.ip) ) {
            return true
          }
          return false
        }
      } 
    }
    return async function tracking( ctx, next ){
      const request_time_start = ctx.state.request_time_start = Date.now()
      
      const request_id = ctx.req.id = ctx.state.request_id = base62(18)
      ctx.set('x-request-id', ctx.state.request_id)

      let transaction_id = null
      const incoming_trx_id = ctx.get('x-transaction-id')
      if ( !tx_trust || !incoming_trx_id ){
        transaction_id = request_id
      }
      else {
        if ( tx_trust === true ){
          debug('tracking true transaction id attached "%s"', incoming_trx_id)
          transaction_id = incoming_trx_id
        } else {
          if ( tx_trust(ctx) ) {
            debug('tracking fn true transaction id attached "%s"', incoming_trx_id)
            transaction_id = incoming_trx_id
          } else {
            debug('tracking transaction id defaulted', incoming_trx_id)
            transaction_id = ctx.state.request_id
          } 
        }
      }
      ctx.state.transaction_id = transaction_id
      ctx.set('x-transaction-id', ctx.state.transaction_id)

      debug('tracking - request', ctx.state.request_id, ctx.state.transaction_id, ctx.ip, ctx.state.request_time_start, ctx.method, ctx.url)
      await next()

      ctx.state.request_time_total = Date.now() - request_time_start  // eslint-disable-line require-atomic-updates  
      ctx.set('x-response-time', `${ctx.state.request_time_total}ms`)
      debug('tracking - response', ctx.state.request_id, ctx.state.transaction_id, ctx.ip, ctx.state.request_time_start, ctx.state.request_time_total, ctx.url)
    }
  }

  /**
   * @summary Powered by heade
   * @description tracking
   * @description `.poweredBy` sets the x-powered-by header to something other than koa.
   * @param {string}         powered_by                      - The string to set it to  
   */
  static poweredBy(powered_by = 'handles'){
    return async function poweredBy(ctx, next){
      ctx.set('x-powered-by', powered_by)
      await next()
    }
  }
 
  /**
   * @summary Logging via pino
   * @description logging
   * @description `.logging` attached a pino log instance to ctx.
   * @param {object}         options                      - Options object
   * @param {object}         options.logger               - A pino instance to inject
   * @param {object}         options.log_level            - The log level to use for requests
   */
  static logging(options = {}){
    const { mapHttpRequest, mapHttpResponse } = require('pino-std-serializers')
    const logger = (options.logger) ? options.logger : console
    const log_level = (options.log_level) ? options.log_level : 'info'
    if (typeof logger[log_level] !== 'function') {
      throw Error(`KoaGenericHandle.logging logger['log_level'] is not a function: ${typeof logger.info}`)
    }
    return async function logging(ctx, next){
      let outer_error
      try {
        ctx.log = logger
        await next()
      }
      catch (error) {
        outer_error = error
        throw error
      } 
      finally {
        let log_obj
        try {
          log_obj = {
            ...mapHttpRequest(ctx.req),
            ...mapHttpResponse(ctx.res),
          }
          if (outer_error) {
            log_obj.error = Flatted.parse(Flatted.stringify(outer_error))
            log_obj.error.message = outer_error.message 
            log_obj.error.stack = outer_error.stack 
          }
          logger[log_level](log_obj)
        } catch (logger_error) {
          console.error('logger failed to log with error:', logger_error) 
          console.error('logger failed entry [%s]:', log_level, log_obj, outer_error) 
        }
      }
    }
  }

  static get debug(){
    return debug
  }

  static enableDebug(){
    // debugl.enabled = true
    // debug = debugl
    return true
  }

  static disableDebug(){
    // debugl.enabled = false
    // debug = noop
    return true
  }

  constructor(){
    throw new Error('No class instances for you!')
  }

}

module.exports = {
  KoaGenericHandle,
}
