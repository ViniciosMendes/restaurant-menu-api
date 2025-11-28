import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET not configured in .env file');
    return res.status(500).json({ message: 'Internal server configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    // Thanks to the type definition, we can assign to req.user
    req.user = decoded; 

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};
