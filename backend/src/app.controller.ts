import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ContactRequestDto } from './dto/contact-request.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('send-contact-request')
  sendContactRequest(@Body() contactRequestDto: ContactRequestDto) {
    return this.appService.sendContactRequest(contactRequestDto);
  }
}
