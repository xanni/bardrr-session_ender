const moveOne = require('../helpers/moveOne');

const getIsInClickhouse = require('../helpers/getIsInClickhouse');
const insertIntoClickhouse = require('../helpers/insertIntoClickhouse');
const deleteFromPostgres = require('../helpers/deleteFromPostgres');
jest.mock('../helpers/getIsInClickhouse');
jest.mock('../helpers/insertIntoClickhouse');
jest.mock('../helpers/deleteFromPostgres');

describe('moveOne', () => {
  test('if not in clickhouse then insert', async () => {
    const mockPostgresClient = {};
    const mockClickhouseClient = {};
    const mockSession = 'a0';

    getIsInClickhouse.mockReturnValueOnce(true);
    insertIntoClickhouse.mockReturnValueOnce(undefined);
    deleteFromPostgres.mockReturnValueOnce(undefined);

    await moveOne(mockPostgresClient, mockClickhouseClient, mockSession);
    expect(insertIntoClickhouse.mock.calls.length).toBe(0);
  });
});
