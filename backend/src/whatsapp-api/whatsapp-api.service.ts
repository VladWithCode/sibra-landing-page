import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { asyncHandler, dateToLongDate } from 'src/utils/helpers';
import { firstValueFrom } from 'rxjs';
import { open } from 'fs/promises';

@Injectable()
export class WhatsappApiService {
  static LogFilePath = process.env.LOG_FILE || process.cwd() + '/logs/campina.txt';

  constructor(private readonly httpService: HttpService) {}

  private async logRequest({
    customerPhone,
    customerName,
    date,
  }: {
    customerPhone: string;
    customerName: string;
    date: Date;
  }) {
    const file = await open(WhatsappApiService.LogFilePath, 'a');

    const logMessage = `[Solicitud de contacto] ${date.toLocaleDateString(
      'es-MX',
    )}
    Cliente: ${customerName}
    Telefono: ${customerPhone}
    --------------------------`;

    file.appendFile(logMessage + '\n', { encoding: 'utf8' });

    await file.close();
  }

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

  async fakeRequest({ name, phone }: { name: string; phone: string }) {
    const [logError] = await asyncHandler(
      this.logRequest({
        customerPhone: phone,
        customerName: name,
        date: new Date(),
      }),
    );

    if (logError) {
      console.error('[LOG_ERR]: ', logError);
    }

    return {
      status: 'OK',
    };
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

    const [sendNotificationError, response] = await asyncHandler(
      this.postCloudAPIMessage({
        toPhoneNumber: '52' + process.env.WHATSAPP_NOTIFICATIONS_PHONE,
        type: 'template',
        templateData,
      }),
    );
    const [sendDataError, sendDataResponse] = await asyncHandler(
      this.sendWhatsAppProjectInfo({ phone, name }),
    );
    const [logError] = await asyncHandler(
      this.logRequest({
        customerPhone: phone,
        customerName: name,
        date: new Date(),
      }),
    );

    if (sendDataError) {
      console.error('[SEND_DATA_ERROR]: ', sendDataError);
    }

    if (logError) {
      console.error('[LOG_ERR]: ', logError);
    }

    if (sendNotificationError) {
      console.error('[SEND_NOTIFICATION_ERROR]: ', sendNotificationError);
      throw new Error('Error al enviar la solicitud de contacto');
    }

    return {
      notificationResponse: response.data,
      sendDataResponse,
    };
  }

  async sendWhatsAppProjectInfo({ name, phone }) {
    const vName = {
      type: 'text',
      text: name,
    };

    const templateData = {
      name: 'project_info',
      bodyVariables: [vName],
    };

    const [sendError, response] = await asyncHandler(
      this.postCloudAPIMessage({
        toPhoneNumber: '52' + phone,
        type: 'template',
        templateData,
      }),
    );

    if (sendError) {
      console.error(sendError);
      throw new Error('Error al enviar la información del proyecto');
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
