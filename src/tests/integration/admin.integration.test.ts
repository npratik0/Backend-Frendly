// import request from "supertest";
// import express from "express";
// import router from "../../routes/admin/user.routes";

// jest.mock("../../middlewares/authorized.middleware", () => ({
//   authorizedMiddleware: (req: any, res: any, next: any) => next(),
//   adminMiddleware: (req: any, res: any, next: any) => next(),
// }));

// jest.mock("../../middlewares/upload.middleware", () => ({
//   uploads: {
//     single: () => (req: any, res: any, next: any) => next()
//   }
// }));

// jest.mock("../../services/admin/user.service");

// const app = express();
// app.use(express.json());
// app.use("/api/admin/users", router);

// describe("Admin Routes Integration", () => {

//   it("should get all users", async () => {
//     const res = await request(app)
//       .get("/api/admin/users");

//     expect(res.status).toBe(200);
//   });

//   it("should return 404 when deleting non-existing user", async () => {
//     const res = await request(app)
//       .delete("/api/admin/users/invalidId");

//     expect(res.status).toBe(404);
//   });

// });

import request from "supertest";
import express from "express";
import router from "../../routes/admin/user.routes";
import { AdminUserService } from "../../services/admin/user.service";

// Mock middlewares
jest.mock("../../middlewares/authorized.middleware", () => ({
  authorizedMiddleware: (req: any, res: any, next: any) => next(),
  adminMiddleware: (req: any, res: any, next: any) => next(),
}));

jest.mock("../../middlewares/upload.middleware", () => ({
  uploads: {
    single: () => (req: any, res: any, next: any) => next()
  }
}));

// Mock service
jest.mock("../../services/admin/user.service");

const mockedService =
  AdminUserService as jest.MockedClass<typeof AdminUserService>;

const app = express();
app.use(express.json());
app.use("/api/admin/users", router);

describe("Admin Routes Integration", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get all users", async () => {

    mockedService.prototype.getAllUsers.mockResolvedValue({
      users: [{ _id: "1", email: "test@test.com" }],
      pagination: {
        page: 1,
        size: 10,
        totalItems: 1,
        totalPages: 1
      }
    } as any);

    const res = await request(app)
      .get("/api/admin/users");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("should return 404 when deleting non-existing user", async () => {

    mockedService.prototype.deleteUser.mockRejectedValue({
      statusCode: 404,
      message: "User not found"
    });

    const res = await request(app)
      .delete("/api/admin/users/invalidId");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

});