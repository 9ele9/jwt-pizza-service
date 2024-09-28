const request = require('supertest');
const ender = require('./endpointHelper.js');

test('status code error', () => {
    const error = new ender.StatusCodeError("This is an error", 400);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("This is an error");
})