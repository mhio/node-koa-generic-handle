/* global expect */

import { KoaGenericHandle } from '../../src/KoaGenericHandle.js'
import { mockPino } from '../fixture/helpers.js'

describe('mh::test::unit::KoaGenericHandle', function(){

  it('should load KoaGenericHandle', function(){
    expect( KoaGenericHandle ).to.be.ok    
  })
  
  it('should not create a KoaGenericHandle', function(){
    let fn = () => new KoaGenericHandle()
    expect( fn ).to.throw('No class')
  })

  it('should return an error function', function(){
    expect( KoaGenericHandle.tracking() ).to.be.a('function')
  })

  it('should return a logging function', function(){
    expect( KoaGenericHandle.logging() ).to.be.a('function')
  })

  it('should survive a logging error and dump it to stderr', async function(){
    const logger = mockPino({
      info: () => { throw new Error('logbad') }
    })
    const logmw = KoaGenericHandle.logging({ logger })
    const ctx = { req: {}, request: {}, res: { on(){} }, response: {} }
    const next = () => Promise.resolve(true)
    const res = await logmw(ctx, next)
    expect(res).to.equal(true)
  })

})
