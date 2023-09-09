import requestTest from 'supertest'
import { beforeEach, afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('test transactions routes', async () => {
  beforeAll(async () => await app.ready())

  afterAll(async () => await app.close())

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should return all transactions', async () => {
    const createTransactionResponse = await requestTest(app.server)
      .post('/api/transactions/')
      .send({
        title: 'Café',
        description: 'Café torrado',
        amount: 45.96,
        type: 'debit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await requestTest(app.server)
      .get('/api/transactions/')
      .set('Cookie', cookies)

    expect(listTransactionsResponse.status).toBe(200)
    expect(listTransactionsResponse.body).toEqual({
      transactions: [
        expect.objectContaining({
          title: 'Café',
          amount: -45.96,
          description: 'Café torrado',
        }),
      ],
    })
  })

  it('should return a unique transaction', async () => {
    const createTransactionResponse = await requestTest(app.server)
      .post('/api/transactions/')
      .send({
        title: 'Café',
        description: 'Café torrado',
        amount: 45.96,
        type: 'debit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await requestTest(app.server)
      .get('/api/transactions/')
      .set('Cookie', cookies)

    const getTransactionResponse = await requestTest(app.server)
      .get(
        `/api/transactions/${listTransactionsResponse.body.transactions[0].id}/`,
      )
      .set('Cookie', cookies)

    expect(getTransactionResponse.status).toBe(200)
    expect(getTransactionResponse.body).toEqual(
      expect.objectContaining({
        title: 'Café',
        description: 'Café torrado',
        amount: -45.96,
      }),
    )
  })

  it('create a transaction', async () => {
    const createTransactionResponse = await requestTest(app.server)
      .post('/api/transactions/')
      .send({
        title: 'Café',
        description: 'Café torrado',
        amount: 45.96,
        type: 'debit',
      })

    const cookies = createTransactionResponse.headers['set-cookie'] as string[]

    expect(createTransactionResponse.status).toBe(201)
    expect(createTransactionResponse.headers['set-cookie']).not.toBeUndefined()
    expect(cookies[0]?.includes('sessionId=')).toBeTruthy()
    expect(createTransactionResponse.body).toStrictEqual({
      message: 'Transaction created successfully',
    })
  })
})
