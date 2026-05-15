import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CustomersService } from '../src/customers/customers.service';
import { Repository, Not } from 'typeorm';
import { Customer } from '../src/customers/entities/customer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { slugify } from '../src/utils/slug';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const customerRepository = app.get<Repository<Customer>>(getRepositoryToken(Customer));

  const customers = await customerRepository.find();
  console.log(`Found ${customers.length} customers. Populating slugs...`);

  for (const customer of customers) {
    const baseSlug = slugify(customer.full_name);
    let slug = baseSlug || 'customer';
    let counter = 1;
    
    while (true) {
      const existing = await customerRepository.findOne({ 
        where: { slug, id: Not(customer.id) } 
      });
      if (!existing) break;
      slug = `${baseSlug || 'customer'}-${counter}`;
      counter++;
    }
    
    if (customer.slug !== slug) {
      await customerRepository.update(customer.id, { slug });
      console.log(`Updated ID ${customer.id}: ${customer.full_name} -> ${slug}`);
    }
  }

  console.log('Done!');
  await app.close();
}

bootstrap();
