import request from "supertest";
import express from "express";
import { AuthController } from "../../controllers/auth.controller";
import { UserService } from "../../services/user.service";

// Mock UserService methods
jest.mock("../../services/user.service");

const app = express();
app.use(express.json());

const authController = new AuthController();

// Routes for testing
app.post("/api/register", (req, res) => authController.register(req, res));
app.post("/api/login", (req, res) => authController.login(req, res));

describe("AuthController Integration", () => {
  const mockedService = UserService as jest.MockedClass<typeof UserService>;

  beforeEach(() => {
    mockedService.prototype.createUser.mockReset();
    mockedService.prototype.loginUser.mockReset();
  });

  const userData = {
    email: "test@test.com",
    password: "123456",
    confirmPassword: "123456",
    username: "testuser",
    phoneNumber: 1234567890,
    gender: "male",
    role: "user",
    fullName: "Test User",
    profilePicture: "",
    bio: ""
  };

  it("should register a user successfully", async () => {
    mockedService.prototype.createUser.mockResolvedValue(userData as any);

    const res = await request(app)
      .post("/api/register")
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(userData.email);
  });

  it("should return 400 if validation fails", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({ invalid: "data" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should login a user successfully", async () => {
    mockedService.prototype.loginUser.mockResolvedValue({
      token: "token123",
      user: userData
    } as any);

    const res = await request(app)
      .post("/api/login")
      .send({ email: userData.email, password: userData.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe("token123");
    expect(res.body.data.email).toBe(userData.email);
  });

  it("should return 400 if login validation fails", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "notanemail" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});