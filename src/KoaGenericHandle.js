import debugi from 'debug'
import base62 from 'base62-random'
import pinoHttp from 'pino-http'

const debug = debugi('mh:KoaGenericHandle')

/** 
  Handle API requests and errors in Koa apps in a standard way. 
*/
export class KoaGenericHandle {

  static getRandomBase62String(n){
    return base62(n)
  }

  /**
   * @summary Request tracking

   * @description `.tracking` provides a request and transaction ID's and a response time header.
   *              Attaches `request_id`, `transaction_id`, `request_start`, `request_total`, to `ctx.state`
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
   * @summary Powered by header
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
   * @param {object}         options.logger?: pino.Logger<CustomLevels> | undefined;
   * @param {object}         options.genReqId?: GenReqId<IM, SR> | undefined;
   * @param {object}         options.useLevel?: pino.LevelWithSilent | undefined;
   * @param {object}         options.stream?: pino.DestinationStream | undefined;
   * @param {object}         options.autoLogging?: boolean | AutoLoggingOptions<IM> | undefined;
   * @param {object}         options.customLogLevel?: ((req: IM, res: SR, error?: Error) => pino.LevelWithSilent) | undefined;
   * @param {object}         options.customReceivedMessage?: ((req: IM, res: SR) => string) | undefined;
   * @param {object}         options.customSuccessMessage?: ((req: IM, res: SR, responseTime: number) => string) | undefined;
   * @param {object}         options.customErrorMessage?: ((req: IM, res: SR, error: Error) => string) | undefined;
   * @param {object}         options.customReceivedObject?: ((req: IM, res: SR, val?: any) => any) | undefined;
   * @param {object}         options.customSuccessObject?: ((req: IM, res: SR, val: any) => any) | undefined;
   * @param {object}         options.customErrorObject?: ((req: IM, res: SR, error: Error, val: any) => any) | undefined;
   * @param {object}         options.customAttributeKeys?: CustomAttributeKeys | undefined;
   * @param {object}         options.wrapSerializers?: boolean | undefined;
   * @param {object}         options.customProps?: ((req: IM, res: SR) => object) | undefined;
   * @param {object}         options.quietReqLogger?: boolean | undefined;
   */
  static logging(options = {}){
    const wrap = pinoHttp({
      quietReqLogger: true,
      ...options,
    })
    function logging(ctx, next) {
      wrap(ctx.req, ctx.res)
      ctx.log = ctx.request.log = ctx.response.log = ctx.req.log
      return next().catch(function (err) {
        ctx.log.error({ err })
        throw err
      })
    }
    logging.logger = wrap.logger
    return logging
  }

  constructor(){
    throw new Error('No class instances for you!')
  }

}
