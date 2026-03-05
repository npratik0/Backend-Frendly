import request from "supertest";
import express from "express";
import { AdminUserController } from "../../../controllers/admin/user.controller";
import { AdminUserService } from "../../../services/admin/user.service";

jest.mock("../../../services/admin/user.service");

const app = express();
app.use(express.json());

const controller = new AdminUserController();
app.post("/admin", (req, res) => controller.createUser(req, res, jest.fn()));

describe("AdminUserController", () => {
  const mockedService = AdminUserService as jest.MockedClass<typeof AdminUserService>;

  beforeEach(() => {
    mockedService.prototype.createUser.mockReset();
  });

  it("should create user successfully", async () => {
    mockedService.prototype.createUser.mockResolvedValue({
      email: "admin@test.com"
    } as any);

    const res = await request(app)
      .post("/admin")
      .send({
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
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should return 400 if validation fails", async () => {
    const res = await request(app)
      .post("/admin")
      .send({});

    expect(res.status).toBe(400);
  });
});

