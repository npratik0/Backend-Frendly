// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         userId: string;
//         email: string;
//       };
//     }
//   }
// }

// export const authenticateToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Access denied. No token provided.",
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
//       userId: string;
//       email: string;
//     };

//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(403).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// };

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

// export const authenticateToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const token =
//       req.cookies.token ||
//       req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Access denied. No token provided.",
//       });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;

//     // IMPORTANT: match the expected structure used in authorized middleware
//     req.user = decoded;

//     next();
//   } catch (error) {
//     return res.status(403).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// };

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const userId = decoded.userId || decoded.id;

    // Normalize structure
    req.user = {
      _id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};