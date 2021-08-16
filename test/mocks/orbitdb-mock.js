/*
  Mocks for orbitdb unit tests.
*/

const mockEventLog = {
  load: () => {},
  events: {
    on: () => {}
  },
  id: 'abc',
  iterator: () => {
    return {
      collect: () => [
        {
          payload: {
            value: {
              data: 'abc123',
              from: 'somePeerId'
            }
          }
        }
      ]
    }
  },
  collect: () => [
    {
      data: 'abc123',
      from: 'somePeerId'
    }
  ]
}

const mockCreateInstance = {
  eventlog: () => {
    return {
      load: () => {},
      events: {
        on: () => {}
      },
      id: 'abc'
    }
  }
}

module.exports = {
  mockEventLog,
  mockCreateInstance
}
