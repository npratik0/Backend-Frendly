// // // import { UserService } from "../../../services/user.service";
// // // import { UserRepository } from "../../../repositories/user.repository";
// // // import bcrypt from "bcryptjs";
// // // import jwt from "jsonwebtoken";

// // // // jest.mock("../../../src/repositories/user.repository");
// // // jest.mock("../../../repositories/user.repository");
// // // jest.mock("bcryptjs");
// // // jest.mock("jsonwebtoken");

// // // describe("UserService", () => {
// // //   let service: UserService;
// // //   let mockRepo: jest.Mocked<UserRepository>;

// // //   beforeEach(() => {
// // //     mockRepo = new UserRepository() as jest.Mocked<UserRepository>;
// // //     service = new UserService();
// // //     (service as any).userRepository = mockRepo;
// // //   });

// // //   it("should create user successfully", async () => {
// // //     mockRepo.getUserByEmail.mockResolvedValue(null);
// // //     mockRepo.getUserByUsername.mockResolvedValue(null);
// // //     (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
// // //     mockRepo.createUser.mockResolvedValue({ email: "test@test.com" } as any);

// // //     const result = await service.createUser({
// // //       email: "test@test.com",
// // //       username: "test",
// // //       password: "123456",
// // //     } as any);

// // //     expect(result.email).toBe("test@test.com");
// // //   });

// // //   it("should throw if email exists", async () => {
// // //     mockRepo.getUserByEmail.mockResolvedValue({} as any);

// // //     await expect(
// // //       service.createUser({ email: "test@test.com" } as any)
// // //     ).rejects.toThrow("Email already in use");
// // //   });

// // //   it("should login user successfully", async () => {
// // //     mockRepo.getUserByEmail.mockResolvedValue({
// // //       _id: "1",
// // //       email: "test@test.com",
// // //       password: "hashed",
// // //       username: "test",
// // //       role: "user",
// // //     } as any);

// // //     (bcrypt.compare as jest.Mock).mockResolvedValue(true);
// // //     (jwt.sign as jest.Mock).mockReturnValue("token");

// // //     const result = await service.loginUser({
// // //       email: "test@test.com",
// // //       password: "123456",
// // //     });

// // //     expect(result.token).toBe("token");
// // //   });

// // //   it("should throw if invalid password", async () => {
// // //     mockRepo.getUserByEmail.mockResolvedValue({
// // //       password: "hashed",
// // //     } as any);

// // //     (bcrypt.compare as jest.Mock).mockResolvedValue(false);

// // //     await expect(
// // //       service.loginUser({
// // //         email: "test@test.com",
// // //         password: "wrong",
// // //       })
// // //     ).rejects.toThrow();
// // //   });
// // // });


// // // // import { UserService } from "../../../services/user.service";
// // // // import { UserRepository } from "../../../repositories/user.repository";
// // // // import bcrypt from "bcryptjs";
// // // // import jwt from "jsonwebtoken";

// // // // jest.mock("../../../repositories/user.repository");
// // // // jest.mock("bcryptjs");
// // // // jest.mock("jsonwebtoken");

// // // // describe("UserService", () => {
// // // //   let userService: UserService;
// // // //   let mockRepo: jest.Mocked<UserRepository>;

// // // //   beforeEach(() => {
// // // //     mockRepo = new UserRepository() as jest.Mocked<UserRepository>;
// // // //     userService = new UserService(mockRepo);
// // // //   });

// // // //   afterEach(() => {
// // // //     jest.clearAllMocks();
// // // //   });

// // // //   it("should register user successfully", async () => {
// // // //     (mockRepo.findByEmail as jest.Mock).mockResolvedValue(null);
// // // //     (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
// // // //     (mockRepo.create as jest.Mock).mockResolvedValue({
// // // //       _id: "123",
// // // //       email: "test@example.com",
// // // //       username: "testuser",
// // // //     });
// // // //     (jwt.sign as jest.Mock).mockReturnValue("mockedToken");

// // // //     const result = await userService.register({
// // // //       email: "test@example.com",
// // // //       password: "Password123",
// // // //       username: "testuser",
// // // //     });

// // // //     expect(mockRepo.findByEmail).toHaveBeenCalled();
// // // //     expect(bcrypt.hash).toHaveBeenCalled();
// // // //     expect(mockRepo.create).toHaveBeenCalled();
// // // //     expect(result.token).toBe("mockedToken");
// // // //   });

// // // //   it("should throw error if user already exists", async () => {
// // // //     (mockRepo.findByEmail as jest.Mock).mockResolvedValue({ email: "exists" });

// // // //     await expect(
// // // //       userService.register({
// // // //         email: "exists@example.com",
// // // //         password: "Password123",
// // // //         username: "testuser",
// // // //       })
// // // //     ).rejects.toThrow();
// // // //   });
// // // // });


// // import { UserService } from "../../../services/user.service";
// // import { UserRepository } from "../../../repositories/user.repository";
// // import bcrypt from "bcryptjs";
// // import jwt from "jsonwebtoken";

// // jest.mock("bcryptjs");
// // jest.mock("jsonwebtoken");

// // describe("UserService", () => {
// //   let service: UserService;
// //   let mockRepo: jest.Mocked<UserRepository>;

// //   beforeEach(() => {
// //     mockRepo = {
// //       createUser: jest.fn(),
// //       getUserByEmail: jest.fn(),
// //       getUserByUsername: jest.fn(),
// //       getUserById: jest.fn(),
// //       updateUser: jest.fn(),
// //       deleteUser: jest.fn(),
// //       findById: jest.fn(),
// //       searchUsers: jest.fn(),
// //       followUser: jest.fn(),
// //       unfollowUser: jest.fn(),
// //       savePost: jest.fn(),
// //       unsavePost: jest.fn(),
// //       getSavedPosts: jest.fn(),
// //       getAllUsers: jest.fn()
// //     } as any;

// //     service = new UserService(mockRepo);
// //   });

// //   afterEach(() => jest.clearAllMocks());

// //   // ==========================
// //   // CREATE USER
// //   // ==========================

// //   it("should create user successfully", async () => {
// //     mockRepo.getUserByEmail.mockResolvedValue(null);
// //     mockRepo.getUserByUsername.mockResolvedValue(null);
// //     (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");

// //     mockRepo.createUser.mockResolvedValue({
// //       email: "test@test.com",
// //       username: "test"
// //     } as any);

// //     const result = await service.createUser({
// //       email: "test@test.com",
// //       password: "123456",
// //       username: "test"
// //     });

// //     expect(result.email).toBe("test@test.com");
// //   });

// //   it("should throw if email exists", async () => {
// //     mockRepo.getUserByEmail.mockResolvedValue({} as any);

// //     await expect(
// //       service.createUser({
// //         email: "test@test.com",
// //         password: "123456",
// //         username: "test"
// //       })
// //     ).rejects.toThrow("Email already in use");
// //   });

// //   // ==========================
// //   // LOGIN
// //   // ==========================

// //   it("should login successfully", async () => {
// //     mockRepo.getUserByEmail.mockResolvedValue({
// //       _id: "1",
// //       email: "test@test.com",
// //       username: "test",
// //       password: "hashed",
// //       role: "user"
// //     } as any);

// //     (bcrypt.compare as jest.Mock).mockResolvedValue(true);
// //     (jwt.sign as jest.Mock).mockReturnValue("token");

// //     const result = await service.loginUser({
// //       email: "test@test.com",
// //       password: "123456"
// //     });

// //     expect(result.token).toBe("token");
// //   });

// //   it("should throw if user not found", async () => {
// //     mockRepo.getUserByEmail.mockResolvedValue(null);

// //     await expect(
// //       service.loginUser({
// //         email: "wrong@test.com",
// //         password: "123"
// //       })
// //     ).rejects.toThrow();
// //   });

// //   // ==========================
// //   // FOLLOW
// //   // ==========================

// //   it("should follow user", async () => {
// //     mockRepo.findById.mockResolvedValue({ _id: "2" } as any);

// //     const result = await service.followUser("1", "2");

// //     expect(result.message).toBe("User followed successfully");
// //   });

// //   it("should not follow self", async () => {
// //     await expect(service.followUser("1", "1")).rejects.toThrow();
// //   });

// //   // ==========================
// //   // SAVE POST
// //   // ==========================

// //   it("should save post", async () => {
// //     const result = await service.savePost("1", "10");
// //     expect(result.message).toBe("Post saved successfully");
// //   });

// // });


// // src/tests/unit/services/user.service.test.ts
// import { UserService } from "../../../services/user.service";
// import { UserRepository } from "../../../repositories/user.repository";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { mockDeep, DeepMockProxy } from "jest-mock-extended";
// import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../../../dtos/user.dto";

// // Mocking UserRepository
// jest.mock("../../../repositories/user.repository");
// jest.mock("bcryptjs");
// jest.mock("jsonwebtoken");

// describe("UserService", () => {
//   let service: UserService;
//   let mockRepo: DeepMockProxy<UserRepository>;

//   beforeEach(() => {
//     mockRepo = mockDeep<UserRepository>();
//     // Override the repository in the service
//     (UserService as any).prototype["userRepository"] = mockRepo;
//     service = new UserService();
//   });

//   const validUser = (): CreateUserDTO => ({
//     email: "test@test.com",
//     password: "123456",
//     username: "testuser",
//     phoneNumber: 1234567890,
//     gender: "male",
//     role: "user",
//     fullName: "Test User",
//     profilePicture: "",
//     bio: ""
//   });

//   it("should create a new user successfully", async () => {
//     mockRepo.getUserByEmail.mockResolvedValue(null);
//     mockRepo.getUserByUsername.mockResolvedValue(null);
//     (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
//     mockRepo.createUser.mockResolvedValue({
//       ...validUser(),
//       password: "hashedpassword",
//       _id: "mockId"
//     } as any);

//     const result = await service.createUser(validUser());

//     expect(result.email).toBe(validUser().email);
//     expect(result.password).toBe("hashedpassword");
//     expect(mockRepo.createUser).toHaveBeenCalledTimes(1);
//   });

//   it("should throw error if email already exists", async () => {
//     mockRepo.getUserByEmail.mockResolvedValue({} as any);

//     await expect(service.createUser(validUser())).rejects.toThrow("Email already in use");
//   });

//   it("should throw error if username already exists", async () => {
//     mockRepo.getUserByEmail.mockResolvedValue(null);
//     mockRepo.getUserByUsername.mockResolvedValue({} as any);

//     await expect(service.createUser(validUser())).rejects.toThrow("Username already in use");
//   });

//   it("should login user successfully", async () => {
//     const user = { ...validUser(), _id: "mockId" };
//     mockRepo.getUserByEmail.mockResolvedValue(user as any);
//     (bcrypt.compare as jest.Mock).mockResolvedValue(true);
//     (jwt.sign as jest.Mock).mockReturnValue("token123");

//     const { token, user: loggedUser } = await service.loginUser({ email: user.email, password: user.password } as LoginUserDTO);

//     expect(token).toBe("token123");
//     expect(loggedUser.email).toBe(user.email);
//   });

//   it("should throw error if user not found during login", async () => {
//     mockRepo.getUserByEmail.mockResolvedValue(null);

//     await expect(service.loginUser({ email: "notfound@test.com", password: "123456" } as LoginUserDTO))
//       .rejects.toThrow("User not found");
//   });

//   it("should throw error if password is invalid during login", async () => {
//     const user = { ...validUser(), _id: "mockId" };
//     mockRepo.getUserByEmail.mockResolvedValue(user as any);
//     (bcrypt.compare as jest.Mock).mockResolvedValue(false);

//     await expect(service.loginUser({ email: user.email, password: "wrongpass" } as LoginUserDTO))
//       .rejects.toThrow("Invalid Credentials");
//   });

//   it("should get user by id", async () => {
//     const user = { ...validUser(), _id: "mockId" };
//     mockRepo.getUserById.mockResolvedValue(user as any);

//     const result = await service.getUserById("mockId");

//     expect(result._id).toBe("mockId");
//   });

//   it("should throw error if user not found by id", async () => {
//     mockRepo.getUserById.mockResolvedValue(null);

//     await expect(service.getUserById("wrongId")).rejects.toThrow("User not found");
//   });

//   it("should update user successfully", async () => {
//     const user = { ...validUser(), _id: "mockId" };
//     mockRepo.getUserById.mockResolvedValue(user as any);
//     mockRepo.getUserByEmail.mockResolvedValue(null);
//     mockRepo.getUserByUsername.mockResolvedValue(null);
//     (bcrypt.hash as jest.Mock).mockResolvedValue("newhashed");
//     mockRepo.updateUser.mockResolvedValue({ ...user, username: "newname", password: "newhashed" } as any);

//     const result = await service.updateUser("mockId", { username: "newname", password: "123456", email: user.email } as UpdateUserDTO);

//     expect(result.username).toBe("newname");
//     expect(result.password).toBe("newhashed");
//   });

//   it("should throw error if email is already in use during update", async () => {
//     const user = { ...validUser(), _id: "mockId", email: "old@test.com" };
//     mockRepo.getUserById.mockResolvedValue(user as any);
//     mockRepo.getUserByEmail.mockResolvedValue({} as any);

//     await expect(service.updateUser("mockId", { email: "alreadyused@test.com", username: "newname" } as UpdateUserDTO))
//       .rejects.toThrow("Email already in use");
//   });

//   it("should throw error if username is already in use during update", async () => {
//     const user = { ...validUser(), _id: "mockId", username: "oldname" };
//     mockRepo.getUserById.mockResolvedValue(user as any);
//     mockRepo.getUserByEmail.mockResolvedValue(null);
//     mockRepo.getUserByUsername.mockResolvedValue({} as any);

//     await expect(service.updateUser("mockId", { username: "alreadytaken", email: "new@test.com" } as UpdateUserDTO))
//       .rejects.toThrow("Username already in use");
//   });
// });

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