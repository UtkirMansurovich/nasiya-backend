import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await usersService.create({
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
  });

  console.log('✅ Admin user yaratildi!');
  console.log('Username: admin');
  console.log('Password: admin123');

  await app.close();
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
seed();
