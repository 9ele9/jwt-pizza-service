const request = require('supertest');
const app = require('../service');
const { DB } = require('../database/database.js');
const badUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a'};
let defaultMenu =[{ id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' }];
let testAdmin;
let adminAuthToken;
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
    const adminAuthToken = adminRes.body.token;
});

test('menu get', async()=>{
    const menuRes = await request(app).get('/api/order/menu');
    expect(menuRes.status).toBe(200);
})

test('menu add', async()=>{
    const newID = defaultMenu.length;
    const newItem = { id: newID, title: `${DB.randomName()}`, image: 'none', price: 0.0001, description: 'none' };
    const addRes = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${adminAuthToken}`).send(newItem);
    expect(addRes.status).toBe(200);

    const baddItem = { id: newID+1, title: `${DB.randomName()}`, image: 'AAAAAAAAA', price: 999999999, description: 'AAAAAAAA' };
    const baddRes = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${badUserAuthToken}`).send(baddItem);
    expect(baddRes.status).toBe(403);
})

test('order create', async()=>{
    const newOrder = {"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}
    const orderRes = await request(app).post('/api/order').set('Authorization', `Bearer ${badUserAuthToken}`).send(newOrder);
    expect(orderRes.status).toBe(200);
})