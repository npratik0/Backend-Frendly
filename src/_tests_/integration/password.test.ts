import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Password Reset Integration Tests', () => {
    const testUser = {
        username: 'resetuser',
        email: 'reset@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'Reset User',
        phone: '6666666666'
    };

    beforeAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await request(app).post('/api/auth/register').send(testUser);
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
    });

    describe('POST /api/auth/request-password-reset', () => {
        test('should request password reset', async () => {
            const response = await request(app)
                .post('/api/auth/request-password-reset')
                .send({ email: testUser.email });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        }, 10000); // ✅ FIXED: 10 second timeout for email sending

        test('should handle non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/request-password-reset')
                .send({ email: 'nonexistent@test.com' });

            expect(response.status).toBe(404);
        });

        describe('POST /api/auth/reset-password/:token', () => {
            test('should reset password with valid token', async () => {
                // First request a reset
                const resetRequest = await request(app)
                    .post('/api/auth/request-password-reset')
                    .send({ email: testUser.email });

                expect(resetRequest.status).toBe(200);

                // In real scenario, token would come from email
                // For testing, we'll generate a valid token
                const jwt = require('jsonwebtoken');
                const user = await UserModel.findOne({ email: testUser.email });
                const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET || 'foodify_secret_key', { expiresIn: '1h' });

                // Now reset password
                const response = await request(app)
                    .post(`/api/auth/reset-password/${token}`)
                    .send({ newPassword: 'NewPassword123!' });

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
            }, 10000);

            test('should not reset password with invalid token', async () => {
                const response = await request(app)
                    .post('/api/auth/reset-password/invalid-token')
                    .send({ newPassword: 'NewPassword123!' });

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('success', false);
            });
        });
    });
});