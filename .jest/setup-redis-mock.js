const redisMock = require("redis-mock");

jest.mock("ioredis", () => {
  const mockClient = redisMock.createClient();
  mockClient.ping = jest.fn().mockImplementation(() => Promise.resolve("PONG"));
  mockClient.disconnect = jest.fn().mockImplementation(() => Promise.resolve());
  return jest.fn(() => mockClient);
});
