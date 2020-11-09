/* global expect */

const { KoaGenericHandle } = require('../../')

describe('mh::test::built::module', function(){

  it('should load the KoaGenericHandle', function(){
    expect( KoaGenericHandle, 'KoaGenericHandle module' ).to.be.ok
  })

  it('should return a logging function', function(){
    expect( KoaGenericHandle.logging() ).to.be.a('function')
  })

})
