/* global expect */
import supertest from 'supertest'
import http from 'http'
import Koa from 'koa'

import { KoaGenericHandle } from '../../src/index.js'
import { MemoryStream } from '../fixture/helpers.js'
import pino from 'pino'


describe('mh::test::int::KoaGenericHandle', function(){

  let app = null
  let server = null
  let request

  beforeEach(function(done){
    app = new Koa()
    server = http.createServer(app.callback()).listen(done)
    request = supertest(server)
  })

  afterEach(function(done){
    server.close(done)
  })

  it('should gget a random string', function(){
    expect( KoaGenericHandle.getRandomBase62String(5) ).to.match(/^[0-9a-zA-Z]{5}$/)
  })

  it('should handle koa tracking', async function(){
    app.use(KoaGenericHandle.tracking())
    app.use(ctx => ctx.body = 'aok')
    let res = await request.get('/ok')
    expect( res.status ).to.equal(200)
    expect( res.text ).to.equal('aok')
    expect( res.headers ).to.contain.keys([
      'x-request-id', 'x-transaction-id', 'x-response-time'
    ])
  })

  it('should handle an incoming x-transaction-id if trusted', async function(){
    app.use(KoaGenericHandle.tracking({ transaction_trust: true }))
    app.use(ctx => ctx.body = 'aok')
    let res = await request.get('/ok').set('x-transaction-id', 'wakka')
    expect( res.status ).to.equal(200)
    expect( res.text ).to.equal('aok')
    expect( res.headers ).to.contain.keys([
      'x-request-id', 'x-transaction-id', 'x-response-time'
    ])
    expect( res.headers['x-transaction-id'] ).to.equal('wakka')
  })

  it('should handle an incoming x-transaction-id if ip is trusted', async function(){
    app.use(KoaGenericHandle.tracking({ transaction_trust: 'ip', transaction_trust_ips: ['::ffff:127.0.0.1', '127.0.0.1', '::1'] }))
    app.use(ctx => ctx.body = 'aok')
    let res = await request.get('/ok').set('x-transaction-id', 'wakka')
    expect( res.text ).to.equal('aok')
    expect( res.status ).to.equal(200)
    expect( res.headers ).to.contain.keys([
      'x-request-id', 'x-transaction-id', 'x-response-time'
    ])
    expect( res.headers['x-transaction-id'] ).to.equal('wakka')
  })
  it('should handle an incoming x-transaction-id if ip is not trusted', async function(){
    app.use(KoaGenericHandle.tracking({ transaction_trust: 'ip', transaction_trust_ips: ['8.8.8.8'] }))
    app.use(ctx => ctx.body = 'aok')
    let res = await request.get('/ok').set('x-transaction-id', 'wakka')
    expect( res.text ).to.equal('aok')
    expect( res.status ).to.equal(200)
    expect( res.headers ).to.contain.keys([
      'x-request-id', 'x-transaction-id', 'x-response-time'
    ])
    expect( res.headers['x-transaction-id'] ).to.not.equal('wakka')
    expect( res.headers['x-transaction-id'] ).to.match(/^\w{18}$/)
  })
  it('should fail if `ip` and no trusted ips supplied', async function(){
    let fn = () => app.use(KoaGenericHandle.tracking({ transaction_trust: 'ip' }))
    expect(fn).to.throw('must have a list')
  })
  it('should fail if `ip` and no trusted ips supplied', async function(){
    let fn = () => app.use(KoaGenericHandle.tracking({ transaction_trust: 'ip', transaction_trust_ips: true }))
    expect(fn).to.throw('support `.includes`')
  })

  describe('logging', function(){
    it('should run a logger', async function(){
      const mem = new MemoryStream()
      const logger = pino(mem)
      app.use(KoaGenericHandle.logging({ logger }))
      app.use(ctx => { ctx.body = 'response' })
      await request.get('/request')
      expect(mem.logs[0]).to.containSubset({ req: {}, res: {} })
      expect(mem.logs[0].req, 'req').to.containSubset({
        headers: {},
        method: 'GET',
        url: '/request',
      })
      expect(mem.logs[0].res, 'res').to.containSubset({
        headers: {
          'content-length': '8',
          'content-type': 'text/plain; charset=utf-8'
        },
        statusCode: 200,
      })
    })

    it('should run a logger on error', async function(){
      const mem = new MemoryStream()
      const logger = pino(mem)
      app.use(KoaGenericHandle.logging({ logger }))
      app.use(() => {
        const err = new Error('nope')
        err.code = 'wat'
        throw err
      })
      await request.get('/error')
      expect(mem.logs[0]).to.containSubset({
        err: { message: 'nope', code: 'wat' }
      })
      expect(mem.logs[1]).to.containSubset({
        req: {
          headers: {},
          method: 'GET',
          url: '/error',
        },
        res: {
          headers: {},
        },
      })
    })
    it('should run a logger on error', async function(){
      const fn = () => app.use(KoaGenericHandle.logging({ logger: {} }))
      expect(fn).to.throw(/not a function/) 
    })
  })
  
  describe('poweredBy', function(){
    it('should include a default', async function(){
      app.use(KoaGenericHandle.poweredBy())
      const res = await request.get('/error')
      expect(res.headers).to.containSubset({ 'x-powered-by': 'handles' })
    })
    it('should include a default', async function(){
      app.use(KoaGenericHandle.poweredBy('test'))
      const res = await request.get('/error')
      expect(res.headers).to.containSubset({ 'x-powered-by': 'test' })
    })
  })

  describe('logging & tracking', function(){
    it('should log the request id', async function(){
      const mem = new MemoryStream()
      const logger = pino(mem)
      app.use(KoaGenericHandle.tracking())
      app.use(KoaGenericHandle.logging({ logger }))
      app.use(ctx => { ctx.body = 'response' })
      const res = await request.get('/request')
      expect(mem.logs[0]).to.containSubset({ req: {}, res: {} })
      expect(mem.logs[0].reqId,).to.equal(res.headers['x-request-id'])
    })
  })

})
