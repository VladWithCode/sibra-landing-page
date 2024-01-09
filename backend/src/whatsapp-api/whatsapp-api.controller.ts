import { Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { WhatsappApiService } from './whatsapp-api.service';
import { asyncHandler } from 'src/utils/helpers';

@Controller('whatsapp-api')
export class WhatsappApiController {
  constructor(private readonly whatsappApiService: WhatsappApiService) {}

  @Post('/test-send')
  async testSendMessage() {
    const [sendError, response] = await asyncHandler(
      this.whatsappApiService.sendMessage(
        'Este es un mensaje de prueba desde el backend',
        '526183188452',
      ),
    );

    if (sendError)
      throw new HttpException(sendError, HttpStatus.INTERNAL_SERVER_ERROR);

    return response;
  }
}
