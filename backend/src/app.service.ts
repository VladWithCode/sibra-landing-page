import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContactRequestDto } from './dto/contact-request.dto';
import { WhatsappApiService } from './whatsapp-api/whatsapp-api.service';
import { asyncHandler } from './utils/helpers';

@Injectable()
export class AppService {
  constructor(private readonly whatsappCloudService: WhatsappApiService) {}

  async sendContactRequest(contactRequestDto: ContactRequestDto) {
    const [sendError, response] = await asyncHandler(
      this.whatsappCloudService.sendWhatsAppContactRequest(contactRequestDto),
    );

    if (sendError) {
      console.error('[AppService]: Error ', sendError);
      throw new HttpException(
        {
          message:
            sendError.message ||
            'Ocurrió un error al enviar la solcitud. Intente más tarde',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: 'Se envió la solicitud de contacto.', data: response };
  }
}
