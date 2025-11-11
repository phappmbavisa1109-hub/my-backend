import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
  async streamVideo(url: string) {
    return await axios({
      method: 'get',
      url,
      responseType: 'stream'
    });
  }
}