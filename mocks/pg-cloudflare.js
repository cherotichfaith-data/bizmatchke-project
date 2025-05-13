// Mock implementation for pg-cloudflare
module.exports = {
  // Mock Socket class
  Socket: class Socket {
    constructor() {}
    connect() {
      return Promise.resolve()
    }
    end() {}
    on() {}
    once() {}
    removeListener() {}
  },
  // Mock connect function
  connect: () => Promise.resolve({}),
}
