import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule, // Import HttpModule to make HTTP requests
  ],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
