import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../models/user.models';
import { compare } from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const user = userRepository.create({
      name,
      email,
      password,
    });

    await userRepository.save(user);

    // The password will not be in the response because of the `select: false` option
    return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET not configured in .env file');
        return res.status(500).json({ message: 'Internal server configuration error.' });
    }
    
    const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '1h' }
    );
    
    // Explicitly create user object without password
    const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    return res.status(200).json({ user: userResponse, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default {
    register,
    login
}
