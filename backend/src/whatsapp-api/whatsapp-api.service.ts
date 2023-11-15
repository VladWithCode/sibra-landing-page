import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { asyncHandler, dateToLongDate } from 'src/utils/helpers';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsappApiService {
  constructor(private readonly httpService: HttpService) {}

  private async postCloudAPIMessage({
    toPhoneNumber,
    type,
    message,
    templateData,
  }: {
    toPhoneNumber: string;
    type: 'template' | 'text';
    message?: string;
    templateData?: {
      name: string;
      bodyVariables?: Record<string, any>[];
      headerVariables?: Record<string, any>[];
    };
  }) {
    const requestBody = {
      messaging_product: 'whatsapp',
      to: toPhoneNumber,
      type,
    };

    if (type === 'template') {
      const templateComponents = [];

      if (templateData.bodyVariables)
        templateComponents.push({
          type: 'body',
          parameters: templateData.bodyVariables,
        });

      if (templateData.headerVariables)
        templateComponents.push({
          type: 'header',
          parameters: templateData.headerVariables,
        });

      requestBody['template'] = {
        name: templateData.name,
        components: templateComponents,
        language: {
          code: 'es',
        },
      };
    } else {
      requestBody['message'] = message;
    }

    const [sendError, response] = await asyncHandler(
      firstValueFrom(this.httpService.post('/messages', requestBody)),
    );

    if (sendError) throw sendError.response.data;

    return response.data;
  }

  async sendWhatsAppContactRequest({
    name,
    phone,
    message,
  }: {
    name: string;
    phone: string;
    message?: string;
  }) {
    const vDate = {
      type: 'text',
      text: dateToLongDate(new Date()),
    };
    const vName = {
      type: 'text',
      text: name,
    };
    const vPhone = {
      type: 'text',
      text: phone,
    };
    const vMessage = {
      type: 'text',
      text: message || 'Sin mensaje',
    };

    const templateData = {
      name: 'info_request',
      bodyVariables: [vName, vDate, vPhone, vMessage],
    };

    const [sendError, response] = await asyncHandler(
      this.postCloudAPIMessage({
        toPhoneNumber: '526183188452',
        type: 'template',
        templateData,
      }),
    );

    if (sendError) {
      console.error(sendError);
      throw new Error('Error al enviar la solicitud de contacto');
    }

    return response.data;
  }

  async sendMessage(message: string, phoneNumber: string) {
    const [sendError, response] = await asyncHandler(
      this.postCloudAPIMessage({
        type: 'text',
        toPhoneNumber: phoneNumber,
        message: message,
      }),
    );

    if (sendError)
      throw {
        message: 'Ocurrio un error al enviar el mensaje',
        e: sendError,
      };

    return response.messages;
  }
}
