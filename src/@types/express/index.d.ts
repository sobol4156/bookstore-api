import type { User } from "@prisma/client";
import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}


declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      role: Role;
    }
  }
}