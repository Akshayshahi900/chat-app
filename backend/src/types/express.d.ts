import { JwtPayload } from 'jsonwebtoken';
import { Multer } from 'multer';  
declare global{
  namespace Express{
    interface Request{
      user?:SafeUser;
      file?: Express.Multer.File;
    }
  }
}
export {};
