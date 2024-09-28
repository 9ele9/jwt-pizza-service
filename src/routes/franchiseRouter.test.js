const request = require('supertest');
const app = require('../service');
const { DB } = require('../database/database.js');
const badUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a'};
let testAdmin;
let adminAuthToken;
let adminID;
let badUserAuthToken;
//req format: {"name": "Pete's a nerd", "admins": [{"email": "f@jwt.com"}]}
beforeAll(async () =>{
    //create non-admin
    badUser.email = Math.random().toString(36).substring(2,12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(badUser);
    badUserAuthToken = registerRes.body.token;

    //create admin
    testAdmin = await DB.createAdminUser();
    const adminRes = await request(app).put('/api/auth').send(testAdmin);
    adminAuthToken = adminRes.body.token;
    adminID = adminRes.body.user.id;
});

test('create and bad create', async ()=>{
    const testFranchise = {"name": `${DB.randomName()}`, "admins": [{"email": `${testAdmin.email}`}]}
    const franchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminAuthToken}`).send(testFranchise);
    expect(franchiseRes.status).toBe(200);

    const badFranchise = {"name": `${DB.randomName()}`, "admins": [{"email": `${badUser.email}`}]}
    const badRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${badUserAuthToken}`).send(badFranchise);
    expect(badRes.status).toBe(403);
})

test('get', async()=>{
    const testFranchise = {"name": `${DB.randomName()}`, "admins": [{"email": `${testAdmin.email}`}]}
    const franchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminAuthToken}`).send(testFranchise);
    expect(franchiseRes.status).toBe(200);
    
    const getRes = await request(app).get(`/api/franchise/${adminID}`).set('Authorization', `Bearer ${adminAuthToken}`);
    expect(getRes.status).toBe(200);

    const allRes = await request(app).get(`/api/franchise`).set('Authorization', `Bearer ${adminAuthToken}`);
    expect(allRes.status).toBe(200);
})

test('delete', async ()=>{
    const testFranchise = {"name": `${DB.randomName()}`, "admins": [{"email": `${testAdmin.email}`}]}
    const franchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminAuthToken}`).send(testFranchise);
    expect(franchiseRes.status).toBe(200);

    const badRes = await request(app).delete(`/api/franchise/${franchiseRes.body.id}`).set('Authorization', `Bearer ${badUserAuthToken}`);
    expect(badRes.status).toBe(403);

    const deleteRes = await request(app).delete(`/api/franchise/${franchiseRes.body.id}`).set('Authorization', `Bearer ${adminAuthToken}`);
    expect(deleteRes.status).toBe(200);
})

test('store', async()=>{
    const testFranchise = {"name": `${DB.randomName()}`, "admins": [{"email": `${testAdmin.email}`}]}
    const franchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminAuthToken}`).send(testFranchise);
    expect(franchiseRes.status).toBe(200);

    const testStore = {"franchiseId": `${franchiseRes.body.id}`, "name":`${DB.randomName()}`};
    const storeRes = await request(app).post(`/api/franchise/${franchiseRes.body.id}/store`).set('Authorization', `Bearer ${adminAuthToken}`).send(testStore);
    expect(storeRes.status).toBe(200);

    const badRes = await request(app).delete(`/api/franchise/${franchiseRes.body.id}/store/${storeRes.id}`).set('Authorization', `Bearer ${badUserAuthToken}`);
    expect(badRes.status).toBe(403);

    const deleteRes = await request(app).delete(`/api/franchise/${franchiseRes.body.id}/store/${storeRes.id}`).set('Authorization', `Bearer ${adminAuthToken}`);
    expect(deleteRes.status).toBe(200);

})