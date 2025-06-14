// test/app.test.js
const request = require('supertest');
const app = require('./app.js'); // Import app-ը

describe('API Tests', () => {
  test('GET /', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
  });
});