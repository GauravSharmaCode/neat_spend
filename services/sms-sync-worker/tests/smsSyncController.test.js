const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const smsSyncRoutes = require('../src/routes/smsSyncRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/api/v1/sms-sync', smsSyncRoutes);

describe('SMS Sync Worker API', () => {
  it('should return 400 if userId or messages are missing for full sync', async () => {
    const res = await request(app)
      .post('/api/v1/sms-sync/full')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 400 if userId or message are missing for single sync', async () => {
    const res = await request(app)
      .post('/api/v1/sms-sync/message')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 400 if userId is missing for getAllMessages', async () => {
    const res = await request(app)
      .get('/api/v1/sms-sync/messages');
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 400 if userId or id is missing for getSingleMessage', async () => {
    const res = await request(app)
      .get('/api/v1/sms-sync/message/123');
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 400 if userId, id, or message is missing for updateMessage', async () => {
    const res = await request(app)
      .patch('/api/v1/sms-sync/message/123')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should return 400 if userId or id is missing for deleteMessage', async () => {
    const res = await request(app)
      .delete('/api/v1/sms-sync/message/123');
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});
