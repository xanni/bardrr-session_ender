const initializeClickhouseClient = require('../helpers/initializeClickhouseClient');

const clickhouseClient = require('@clickhouse/client');
jest.mock('@clickhouse/client');

describe('initializeClickhouseClient', () => {
  test('calls createClient with correct argument', () => {
    clickhouseClient.createClient.mockReturnValueOnce(undefined);

    initializeClickhouseClient();
    expect(clickhouseClient.createClient.mock.calls[0][0]).toStrictEqual({
      host: `http://${process.env.CLICKHOUSE_HOST}:8123`,
    });
  });

  test('returns client', () => {
    const mockClient = { myKey: 'myValue' };
    clickhouseClient.createClient.mockReturnValueOnce(mockClient);

    const result = initializeClickhouseClient();
    expect(result).toStrictEqual(mockClient);
  });
})