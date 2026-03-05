import request from "supertest";
import express from "express";
import { AuthController } from "../../../controllers/auth.controller";
// jest.mock("../../../src/services/user.service");
jest.mock("../../../services/user.service");

const app = express();
app.use(express.json());

const controller = new AuthController();
app.post("/register", controller.register);

describe("AuthController", () => {
  it("should return 400 for invalid input", async () => {
    const res = await request(app).post("/register").send({});
    expect(res.status).toBe(400);
  });
});