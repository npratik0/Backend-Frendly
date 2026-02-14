import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import path from 'path';

describe('Profile Update Integration Tests', () => {
    let userToken: string;
    let userId: string;

    const testUser = {
        username: 'profileuser',
        email: 'profile@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'Profile User',
        phone: '5555555555'
    };

    beforeAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });

        // Register user
        await request(app)
            .post('/api/auth/register')
            .send(testUser);

        // Login to get token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        userToken = loginResponse.body.token;
        userId = loginResponse.body.user._id;
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
    });

    describe('PUT /api/auth/:id', () => {
        test('should update user profile', async () => {
            const response = await request(app)
                .put(`/api/auth/${userId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    fullName: 'Updated Name',
                    phone: '9999999999'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data.fullName).toBe('Updated Name');
        });
    });
});