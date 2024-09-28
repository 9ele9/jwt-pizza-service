const request = require('supertest');
const app = require('../service');
const { DB } = require('../database/database.js');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a'};
let testUserAuthToken;
let testUserID;

beforeAll(async () =>{
    testUser.email = Math.random().toString(36).substring(2,12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    testUserID = registerRes.body.user.id;
});

test('registration', async()=>{
    const badUser = { name: 'evil diner', email: 'r3g@test.com'};
    const badRegRes = await request(app).post('/api/auth').send(badUser);
    expect(badRegRes.status).toBe(400);
})

test('login', async () => {
    const loginRes = await request(app).put('/api/auth').send(testUser);
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-]*\.[a-zA-Z0-9-_]*\.[a-zA-Z0-9\-_]*$/);
    
    const {password,...user} = {...testUser, roles: [{role:'diner'}] };
    expect(loginRes.body.user).toMatchObject(user);
});

test('update', async () => {
    testAdmin = await DB.createAdminUser();

    const adminRes = await request(app).put('/api/auth').send(testAdmin);
    expect(adminRes.status).toBe(200);
    
    adminAuthToken = adminRes.body.token;
    const newTestUser = { name: 'pizza diner', email: 'reg@test.com', password: 'qqqqqq'}
    const updateReq = await request(app).put(`/api/auth/${testUserID}`).set('Authorization', `Bearer ${adminAuthToken}`).send(newTestUser);
    expect(updateReq.status).toBe(200);
})

test('badUpdate', async () => {
    testAdmin = await DB.createAdminUser();
    const adminRes = await request(app).put('/api/auth').send(testAdmin);
    expect(adminRes.status).toBe(200);

    adminAuthToken = adminRes.body.token;

    const newTestUser = { name: 'pizza diner', email: 'reg@test.com', password: 'qqqqqq'}

    const updateReq = await request(app).put('/api/auth/60005').set('Authorization', `Bearer ${testUserAuthToken}`).send(newTestUser);
    expect(updateReq.status).toBe(403);
})

test('logout', async () => {
    const req = request(app);
    const logoutRes = await req.delete('/api/auth').set('Authorization', `Bearer ${testUserAuthToken}`);
    console.log(logoutRes.status);
    expect(logoutRes.status).toBe(200);
    
    const logoutRes2 = await req.delete('/api/auth').send(testUser);
    expect(logoutRes2.status).toBe(401);

});