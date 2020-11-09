/* global expect */

const { KoaApiHandle, KoaApiHandleException } = require('../../')

describe('mh::test::built::module', function(){

  it('should load the KoaApiHandle', function(){
    expect( KoaApiHandle, 'KoaApiHandle module' ).to.be.ok
  })

  it('should load KoaApiHandleException', function(){
    expect( KoaApiHandleException, 'KoaApiHandleException module' ).to.be.ok
  })

})