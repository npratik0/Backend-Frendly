import { AdminUserService } from "../../../services/admin/user.service";
import { UserRepository } from "../../../repositories/user.repository";
import bcrypt from "bcryptjs";
import { HttpError } from "../../../errors/http-error";
import { IUser } from "../../../models/user.model";
import mongoose from "mongoose";

jest.mock("bcryptjs");

describe("AdminUserService", () => {
  let service: AdminUserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByUsername: jest.fn(),
      getUserById: jest.fn(),
      getAllUsers: jest.fn(),
      deleteUser: jest.fn(),
      updateUser: jest.fn()
    } as any;

    service = new AdminUserService(mockRepo);
  });

  const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  email: "admin@test.com",
  username: "adminuser",
  password: "123456",
  followers: [],
  following: [],
  savedPosts: [],
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

  // =============================
  // CREATE USER
  // =============================

  it("should create user successfully", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    mockRepo.getUserByUsername.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");

    mockRepo.createUser.mockResolvedValue({
      ...mockUser,
      password: "hashed"
    } as any);

    const result = await service.createUser(mockUser as any);

    expect(result.password).toBe("hashed");
    expect(mockRepo.createUser).toHaveBeenCalled();
  });

  it("should throw if email already exists", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(mockUser as any);

    await expect(service.createUser(mockUser as any))
      .rejects.toThrow("Email already in use");
  });

  // =============================
  // GET ALL USERS (pagination)
  // =============================

  it("should return paginated users", async () => {
    mockRepo.getAllUsers.mockResolvedValue({
      users: [mockUser],
      total: 1
    });

    const result = await service.getAllUsers("1", "10", "");

    expect(result.pagination.totalItems).toBe(1);
    expect(result.users.length).toBe(1);
  });

  
  // DELETE USER
  

  it("should delete user successfully", async () => {
    mockRepo.getUserById.mockResolvedValue(mockUser as any);
    mockRepo.deleteUser.mockResolvedValue(true);

    const result = await service.deleteUser("mockId");

    expect(result).toBe(true);
  });

  it("should throw if user not found", async () => {
    mockRepo.getUserById.mockResolvedValue(null);

    await expect(service.deleteUser("wrongId"))
      .rejects.toThrow("User not found");
  });
});

