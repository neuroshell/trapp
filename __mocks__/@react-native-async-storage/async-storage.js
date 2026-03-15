const mockStore = {};

const mockAsyncStorage = {
  getItem: jest.fn((key) => {
    return Promise.resolve(mockStore[key] ?? null);
  }),
  setItem: jest.fn((key, value) => {
    mockStore[key] = value;
    return Promise.resolve(value);
  }),
  removeItem: jest.fn((key) => {
    delete mockStore[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(mockStore).forEach((key) => delete mockStore[key]);
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStore))),
};

export default mockAsyncStorage;
