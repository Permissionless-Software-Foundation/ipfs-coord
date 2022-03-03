/*
describe('#publishToPubsubChannel', () => {
  it('should publish a message', async () => {
    const chanName = 'chanName'
    const msgStr = 'test message'

    await uut.publishToPubsubChannel(chanName, msgStr)

    assert.equal(true, true, 'Not throwing an error is a pass')
  })

  it('should catch and throw errors', async () => {
    try {
      // Force an error
      sandbox
        .stub(uut.ipfs.ipfs.pubsub, 'publish')
        .rejects(new Error('test error'))

      await uut.publishToPubsubChannel()

      assert.fail('Unexpected code path')
    } catch (err) {
      // console.log('err: ', err)
      assert.include(err.message, 'The first argument')
    }
  })
})
*/
