import { UserService } from "../../../services/user.service";
import { UserRepository } from "../../../repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../../../dtos/user.dto";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("UserService", () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByUsername: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      findById: jest.fn(),
      searchUsers: jest.fn(),
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      savePost: jest.fn(),
      unsavePost: jest.fn(),
      getSavedPosts: jest.fn(),
      getAllUsers: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    service = new UserService(mockRepo); // dependency injection
  });

  const validUser = (): CreateUserDTO => ({
    email: "test@test.com",
    password: "123456",
    username: "testuser",
    phoneNumber: 1234567890,
    gender: "male",
    role: "user",
    fullName: "Test User",
    profilePicture: "",
    bio: ""
  });

  // =========================
  // CREATE USER
  // =========================

  it("should create user successfully", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    mockRepo.getUserByUsername.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

    mockRepo.createUser.mockResolvedValue({
      ...validUser(),
      password: "hashedpassword",
      _id: "mockId"
    } as any);

    const result = await service.createUser(validUser());

    expect(result.email).toBe(validUser().email);
    expect(result.password).toBe("hashedpassword");
  });

  it("should throw if email exists", async () => {
    mockRepo.getUserByEmail.mockResolvedValue({} as any);

    await expect(service.createUser(validUser()))
      .rejects.toThrow("Email already in use");
  });

  it("should throw if username exists", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    mockRepo.getUserByUsername.mockResolvedValue({} as any);

    await expect(service.createUser(validUser()))
      .rejects.toThrow("Username already in use");
  });

  // =========================
  // LOGIN
  // =========================

  it("should login successfully", async () => {
    const user = { ...validUser(), _id: "mockId", password: "hashed" };

    mockRepo.getUserByEmail.mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("token123");

    const result = await service.loginUser({
      email: user.email,
      password: "123456"
    } as LoginUserDTO);

    expect(result.token).toBe("token123");
    expect(result.user.email).toBe(user.email);
  });

  it("should throw if login user not found", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);

    await expect(service.loginUser({
      email: "wrong@test.com",
      password: "123"
    } as LoginUserDTO))
      .rejects.toThrow("User not found");
  });

  it("should throw if password invalid", async () => {
    const user = { ...validUser(), _id: "mockId", password: "hashed" };

    mockRepo.getUserByEmail.mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.loginUser({
      email: user.email,
      password: "wrong"
    } as LoginUserDTO))
      .rejects.toThrow("Invalid Credentials");
  });

  // =========================
  // GET USER BY ID
  // =========================

  it("should get user by id", async () => {
    const user = { ...validUser(), _id: "mockId" };

    mockRepo.getUserById.mockResolvedValue(user as any);

    const result = await service.getUserById("mockId");

    expect(result._id).toBe("mockId");
  });

  it("should throw if user not found", async () => {
    mockRepo.getUserById.mockResolvedValue(null);

    await expect(service.getUserById("wrongId"))
      .rejects.toThrow("User not found");
  });

  // =========================
  // UPDATE USER
  // =========================

  it("should update user successfully", async () => {
    const user = { ...validUser(), _id: "mockId" };

    mockRepo.getUserById.mockResolvedValue(user as any);
    mockRepo.getUserByEmail.mockResolvedValue(null);
    mockRepo.getUserByUsername.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newhashed");

    mockRepo.updateUser.mockResolvedValue({
      ...user,
      username: "newname",
      password: "newhashed"
    } as any);

    const result = await service.updateUser("mockId", {
      username: "newname",
      password: "123456",
      email: user.email
    } as UpdateUserDTO);

    expect(result!.username).toBe("newname");
  });

  it("should throw if email already used in update", async () => {
    const user = { ...validUser(), _id: "mockId" };

    mockRepo.getUserById.mockResolvedValue(user as any);
    mockRepo.getUserByEmail.mockResolvedValue({} as any);

    await expect(service.updateUser("mockId", {
      email: "used@test.com"
    } as UpdateUserDTO))
      .rejects.toThrow("Email already in use");
  });

});