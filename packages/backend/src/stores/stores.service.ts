import {
  Injectable,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

// 定义高德地图API返回的POI（兴趣点）结构，增强代码类型安全
export interface AmapPoi {
  id: string;
  name: string;
  address: string;
  location: string;
}

// 定义高德地图API成功或失败的响应体结构
interface AmapResponse {
  status: '0' | '1'; // '1' 代表成功, '0' 代表失败
  info: string;      // 状态说明
  infocode: string;  // 状态码
  count: string;
  pois: AmapPoi[];
}

@Injectable()
export class StoresService {
  // 使用Logger服务来输出日志，这是NestJS的推荐实践
  private readonly logger = new Logger(StoresService.name);

  // 请将您申请的「Web服务」类型的Key填入此处
  private readonly apiKey = '60a0332b30145115912e5cd3ab0bcecf'; // <--- 在这里填入您的API Key
  private readonly apiUrl = 'https://restapi.amap.com/v3/place/text';

  constructor(private readonly httpService: HttpService) { }

  /**
   * 搜索瑞幸咖啡门店
   * @param city 搜索城市
   * @param keywords 搜索关键词
   * @returns 门店列表
   */
  async searchLuckinCoffee(city: string, keywords?: string): Promise<AmapPoi[]> {
    if (!this.apiKey) {
      this.logger.error('高德地图API Key未配置，请在 stores.service.ts 中填写。');
      throw new InternalServerErrorException('地图服务未正确配置');
    }

    const baseKeywords = '瑞幸咖啡';
    const finalKeywords = keywords ? `${baseKeywords} ${keywords}` : baseKeywords;

    const requestParams = {
      key: this.apiKey,
      keywords: finalKeywords,
      city: city,
      offset: 25,
      page: 1,
      extensions: 'base',
    };

    try {
      this.logger.log(`正在向高德地图API发送请求, 城市: ${city}, 关键词: "${keywords}"`);

      // 1. 发起HTTP请求
      const response = await firstValueFrom(
        this.httpService.get<AmapResponse>(this.apiUrl, { params: requestParams }),
      );

      const amapData = response.data;
      this.logger.log(`收到高德地图API响应: status=${amapData.status}, count=${amapData.count}`);

      // 2. 检查业务逻辑是否成功
      if (amapData.status !== '1') {
        this.logger.error(`高德地图API业务错误: ${amapData.info} (infocode: ${amapData.infocode})`);
        throw new HttpException(`[高德地图服务] ${amapData.info}`, 502);
      }

      // 3. 检查是否有搜索结果
      if (!amapData.pois || amapData.pois.length === 0) {
        this.logger.log('未找到相关门店，返回空数组');
        return [];
      }

      // 4. 成功，返回简化后的门店数据
      this.logger.log(`成功获取 ${amapData.pois.length} 家门店信息`);
      return amapData.pois.map((poi) => ({
        id: poi.id,
        name: poi.name,
        address: poi.address,
        location: poi.location,
      }));

    } catch (error) {
      // 5. 统一处理所有类型的错误
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof AxiosError) {
        this.logger.error(`请求高德地图API时发生网络或HTTP错误: ${error.message}`, error.stack);
        throw new InternalServerErrorException(`无法连接至地图服务: ${error.message}`);
      }

      this.logger.error('搜索门店时发生未知内部错误', error);
      throw new InternalServerErrorException('处理门店数据时发生未知错误');
    }
  }
}