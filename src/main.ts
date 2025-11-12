// src/main.ts - Express App for Cloudflare Workers

import express, { Express, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import serverless from 'serverless-http';
import { User } from './entities/user.entity';
import { Video } from './entities/video.entity';
import { Token } from './entities/token.entity';
import { VideoHistory } from './entities/video-history.entity';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

// Polyfills for Workers
const __dirname = '/worker';
if (typeof (globalThis as any).require === 'undefined') {
  (globalThis as any).require = function(moduleId: string) {
    return {};
  };
}

// Initialize Express app
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
let AppDataSource: DataSource | null = null;

async function initializeDatabase() {
  if (AppDataSource?.isInitialized) {
    return AppDataSource;
  }

  try {
    AppDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'veo3',
      entities: [User, Video, Token, VideoHistory],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
    });

    await AppDataSource.initialize();
    console.log('Database initialized');
    return AppDataSource;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Veo3 API is running', timestamp: new Date() });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Auth routes
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = userRepository.create({
      email,
      password: hashedPassword,
      firstName: firstName || email.split('@')[0],
      lastName: lastName || '',
    });

    await userRepository.save(user);

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export handler for Cloudflare Workers
export const handler = serverless(app);

// For local Node.js development
if (process.env.NODE_ENV !== 'cloudflare') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}