/* global expect */

const { KoaGenericHandle } = require('../../src/KoaGenericHandle')

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

  it('should servive a logging error and dump it to stderr', async function(){
    const logmw = KoaGenericHandle.logging({ logger: {
      info: () => { throw new Error('logbad') }
    }})
    const ctx = { req: {}, res: {} }
    const next = () => Promise.resolve(true)
    const res = await logmw(ctx, next)
    expect(res).to.be.undefined
  })

  describe('reset debug', function(){

    let debug_state = null 
    before(function(){
      debug_state = KoaGenericHandle.debug.enabled
    })
    after(function(){
      KoaGenericHandle.debug.enabled = debug_state
    })

    it('should enable debug', function(){
      expect( KoaGenericHandle.enableDebug() ).to.be.ok
    })

    it('should disalbe debug', function(){
      expect( KoaGenericHandle.disableDebug() ).to.be.ok
    })

  })

})
