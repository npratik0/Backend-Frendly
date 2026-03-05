// import mongoose from "mongoose";
// import { UserRepository } from "../../../repositories/user.repository";
// import { UserModel } from "../../../models/user.model";

// jest.mock("../../../models/user.model");

// describe("UserRepository", () => {
//   let repo: UserRepository;

//   beforeEach(() => {
//     repo = new UserRepository();
//     jest.clearAllMocks();
//   });

//   const userData = {
//     _id: "mockId",
//     email: "test@test.com",
//     username: "testuser",
//     password: "hashed",
//     phoneNumber: 1234567890,
//     gender: "male",
//     role: "user",
//     fullName: "Test User",
//     profilePicture: "",
//     bio: "",
//     savedPosts: []
//   };

//   it("should create a user", async () => {
//     (UserModel as any).mockImplementation(() => ({
//       save: jest.fn().mockResolvedValue(userData)
//     }));

//     const result = await repo.createUser(userData);
//     expect(result).toEqual(userData);
//   });

//   it("should get user by email", async () => {
//     (UserModel.findOne as jest.Mock).mockResolvedValue(userData);

//     const result = await repo.getUserByEmail(userData.email);
//     expect(result).toEqual(userData);
//     expect(UserModel.findOne).toHaveBeenCalledWith({ email: userData.email });
//   });

//   it("should get user by username", async () => {
//     (UserModel.findOne as jest.Mock).mockResolvedValue(userData);

//     const result = await repo.getUserByUsername(userData.username);
//     expect(result).toEqual(userData);
//     expect(UserModel.findOne).toHaveBeenCalledWith({ username: userData.username });
//   });

//   it("should get user by id", async () => {
//     (UserModel.findById as jest.Mock).mockResolvedValue(userData);

//     const result = await repo.getUserById(userData._id);
//     expect(result).toEqual(userData);
//     expect(UserModel.findById).toHaveBeenCalledWith(userData._id);
//   });

//   it("should return null if user not found", async () => {
//     (UserModel.findById as jest.Mock).mockResolvedValue(null);

//     const result = await repo.getUserById("wrongId");
//     expect(result).toBeNull();
//   });
// });

import mongoose from "mongoose";
import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";

jest.mock("../../../models/user.model");

describe("UserRepository", () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
    jest.clearAllMocks();
  });

  // Fix _id type for Mongoose
  const userData = {
    _id: new mongoose.Types.ObjectId(), // <-- ObjectId instead of string
    email: "test@test.com",
    username: "testuser",
    password: "hashed",
    phoneNumber: 1234567890,
    gender: "male",
    role: "user",
    fullName: "Test User",
    profilePicture: "",
    bio: "",
    savedPosts: []
  };

  it("should create a user", async () => {
    (UserModel as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(userData)
    }));

    const result = await repo.createUser(userData as any);
    expect(result).toEqual(userData);
  });

  it("should get user by email", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(userData);

    const result = await repo.getUserByEmail(userData.email);
    expect(result).toEqual(userData);
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: userData.email });
  });

  it("should get user by username", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(userData);

    const result = await repo.getUserByUsername(userData.username);
    expect(result).toEqual(userData);
    expect(UserModel.findOne).toHaveBeenCalledWith({ username: userData.username });
  });

  it("should get user by id", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(userData);

    const result = await repo.getUserById(userData._id as any);
    expect(result).toEqual(userData);
    expect(UserModel.findById).toHaveBeenCalledWith(userData._id);
  });

  it("should return null if user not found", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    const result = await repo.getUserById(new mongoose.Types.ObjectId() as any);
    expect(result).toBeNull();
  });
});