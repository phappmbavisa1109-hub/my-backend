export default () => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
  
  return {
    port,
    database: {
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: dbPort,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'veo3',
      synchronize: true, // TODO: Set up proper migrations
      logging: true,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      ssl: false,
      extra: {
        max: 20,
        connectionTimeoutMillis: 10000,
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'super-secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '30d', // Changed default to 30 days
    },
  };
};