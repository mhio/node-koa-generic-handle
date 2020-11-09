/* global expect */

const { KoaGenericHandle, KoaGenericHandleException } = require('../../')

describe('mh::test::built::module', function(){

  it('should load the KoaGenericHandle', function(){
    expect( KoaGenericHandle, 'KoaGenericHandle module' ).to.be.ok
  })

  it('should load KoaGenericHandleException', function(){
    expect( KoaGenericHandleException, 'KoaGenericHandleException module' ).to.be.ok
  })

  it('should return a logging function', function(){
    expect( KoaGenericHandle.logging() ).to.be.a('function')
  })

})
