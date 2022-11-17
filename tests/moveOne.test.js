const moveOne = require('../helpers/moveOne');

const getIsInClickhouse = require('../helpers/getIsInClickhouse');
const insertIntoClickhouse = require('../helpers/insertIntoClickhouse');
const deleteFromPostgres = require('../helpers/deleteFromPostgres');
jest.mock('../helpers/getIsInClickhouse');
jest.mock('../helpers/insertIntoClickhouse');
jest.mock('../helpers/deleteFromPostgres');

const mockPostgresClient = {};
const mockClickhouseClient = {};
const mockSession = 'c548e1ea-69bc-49a3-bf38-3093d10c71ee';

describe('moveOne', () => {
  beforeEach(() => {
    getIsInClickhouse.mockReset();
    insertIntoClickhouse.mockReset();
    deleteFromPostgres.mockReset();
  });

  test('if in clickhouse then do not insert into clickhouse and delete from postgres', async () => {
    getIsInClickhouse.mockResolvedValueOnce(true);
    insertIntoClickhouse.mockResolvedValueOnce(undefined);
    deleteFromPostgres.mockResolvedValueOnce(undefined);

    await moveOne(mockPostgresClient, mockClickhouseClient, mockSession);

    expect(insertIntoClickhouse.mock.calls.length).toBe(0);
    expect(deleteFromPostgres.mock.calls.length).toBe(1);
    expect(deleteFromPostgres.mock.calls[0][0]).toBe(mockPostgresClient);
    expect(deleteFromPostgres.mock.calls[0][1]).toBe(mockSession);
  });

  test('if not in clickhouse then insert into clickhouse', async () => {
    getIsInClickhouse.mockResolvedValueOnce(false);
    insertIntoClickhouse.mockResolvedValueOnce(undefined);
    deleteFromPostgres.mockResolvedValueOnce(undefined);

    await moveOne(mockPostgresClient, mockClickhouseClient, mockSession);

    expect(insertIntoClickhouse.mock.calls.length).toBe(1);
    expect(insertIntoClickhouse.mock.calls[0][0]).toBe(mockClickhouseClient);
    expect(insertIntoClickhouse.mock.calls[0][1]).toBe(mockSession);
  });

  test('if insert into clickhouse succeeds then delete from postgres', async () => {
    getIsInClickhouse.mockResolvedValueOnce(false);
    insertIntoClickhouse.mockResolvedValueOnce(undefined);

    await moveOne(mockPostgresClient, mockClickhouseClient, mockSession);

    expect(deleteFromPostgres.mock.calls.length).toBe(1);
    expect(deleteFromPostgres.mock.calls[0][0]).toBe(mockPostgresClient);
    expect(deleteFromPostgres.mock.calls[0][1]).toBe(mockSession);
  });

  test('if insert into clickhouse fails then do not delete from postgres', async () => {
    getIsInClickhouse.mockResolvedValueOnce(false);
    insertIntoClickhouse.mockRejectedValueOnce(new Error());

    await moveOne(mockPostgresClient, mockClickhouseClient, mockSession);

    expect(deleteFromPostgres.mock.calls.length).toBe(0);
  });
});
