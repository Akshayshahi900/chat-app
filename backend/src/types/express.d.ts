import { JwtPayload } from 'jsonwebtoken';

declare module 'express-serve-static-core' {
  interface Request {
    user?: string | JwtPayload;
    file?: Express.Multer.File;
  }
}