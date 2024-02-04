import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService, DEFAULT_REDIS_NAMESPACE } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Env, XmlResult } from './entities/ql.entity';
import { createHash } from 'crypto';

import axios from 'axios';
import type { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

const USER_AGENTS = [
  'jdapp;android;10.1.0;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36',
  'jdapp;iPhone;10.1.0;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;android;10.1.0;9;network/4g;Mozilla/5.0 (Linux; Android 9; Mi Note 3 Build/PKQ1.181007.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36',
  'jdapp;android;10.1.0;10;network/wifi;Mozilla/5.0 (Linux; Android 10; GM1910 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36',
  'jdapp;android;10.1.0;9;network/wifi;Mozilla/5.0 (Linux; Android 9; 16T Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36',
  'jdapp;iPhone;10.1.0;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;13.5;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;13.7;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;13.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;android;10.1.0;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36',
  'jdapp;android;10.1.0;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K30 5G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045511 Mobile Safari/537.36',
  'jdapp;iPhone;10.1.0;11.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79',
  'jdapp;android;10.1.0;10;;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36',
  'jdapp;android;10.1.0;10;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36',
  'jdapp;android;10.1.0;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A6000 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045224 Mobile Safari/537.36',
  'jdapp;android;10.1.0;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36',
  'jdapp;android;10.1.0;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; 16 X Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36',
  'jdapp;android;10.1.0;8.0.0;network/wifi;Mozilla/5.0 (Linux; Android 8.0.0; HTC U-3w Build/OPR6.170623.013; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36',
  'jdapp;iPhone;10.1.0;14.0.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;android;10.1.0;10;network/wifi;Mozilla/5.0 (Linux; Android 10; LYA-AL00 Build/HUAWEILYA-AL00L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36',
  'jdapp;iPhone;10.1.0;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;android;10.1.0;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36',
  'jdapp;android;10.1.0;10;network/wifi;Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Premium Edition Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36',
  'jdapp;iPhone;10.1.0;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;iPhone;10.1.0;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
  'jdapp;android;10.1.0;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K20 Pro Premium Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045513 Mobile Safari/537.36',
  'jdapp;android;10.1.0;10;network/wifi;Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36',
  'jdapp;iPhone;10.1.0;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
];

@Injectable()
export class QlService {
  private readonly redis: Redis;
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: LoggerService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }

  private baseUrl = this.configService.get('QL_URL');
  private clientId = this.configService.get('QL_CLIENT_ID');
  private clientSecret = this.configService.get('QL_CLIENT_SECRET');
  private token = '';
  private exp = 0;

  wxsign(req: Request): any {
    const token = 'wx_token';
    const { signature, echostr, timestamp = '', nonce = '' } = req.query;
    const arr = [token, timestamp, nonce].sort().join('');
    const encryption = createHash('sha1').update(arr).digest('hex');
    if (signature === encryption) {
      return echostr;
    } else {
      return 'wechat error';
    }
  }

  async wx(msg: Record<'xml', XmlResult>, res: Response): Promise<any> {
    const txt = msg.xml?.content || [];
    const openid = msg.xml.fromusername[0];
    let content = '';
    if (!txt[0]) {
      content = '哇哦哦哦~你什么都没输入呀~';
    } else if (txt[0] === '京东ck') {
      content = `查看ck请回复:我的ck\n查看资产请回复:查看资产\n添加ck请回复:添加:pt_key=xxx;pt_pin=xxx;\n删除ck请回复:删除:序号\n更新ck请回复:更新:序号:ck\n禁用ck请回复:禁用:序号\n启用ck请回复:启用:序号\n序号可多个,用逗号隔开\n如:禁用:1,2,3禁用序号为1,2,3的ck\n如:启用:1,2,3启用序号为1,2,3的ck\n如:删除:1,2,3删除序号为1,2,3的ck\n如:更新:1:pt_key=x;pt_pin=x;更新序号为1的ck`;
    } else if (txt[0] === '我的ck') {
      content = (await this.getEnv(openid)).txt;
    } else if (txt[0].indexOf('添加:') !== -1 && txt[0].includes('pt_key')) {
      content = await this.addEnv(txt[0], openid);
    } else if (txt[0].indexOf('禁用:') !== -1 || txt[0].indexOf('启用:') !== -1) {
      content = await this.updateStatus(openid, txt[0]);
    } else if (txt[0].indexOf('更新:') !== -1 || txt[0].indexOf('删除:') !== -1) {
      content = await this.updateEnv(openid, txt[0]);
    } else if (txt[0] === '查看资产') {
      content = await this.generateRandomCode(openid);
    } else {
      content = '哇哦~系统出错啦，要不你在试试😁';
    }
    console.log('content', content);
    res.status(200).send(`
    <xml>
      <ToUserName><![CDATA[${openid}]]></ToUserName>
      <FromUserName><![CDATA[${msg.xml.tousername}]]></FromUserName>
      <CreateTime>${Date.now()}</CreateTime>
      <MsgType><![CDATA[text]]></MsgType>
      <Content><![CDATA[${content}]]></Content>
    </xml>
    `);
  }

  async getToken() {
    if (this.token && Date.now() < this.exp) return this.token;
    const { data } = await axios.get(`${this.baseUrl}/auth/token?client_id=${this.clientId}&client_secret=${this.clientSecret}`);
    if (data.code === 200) {
      this.exp = data.data.expiration * 1000;
      this.token = `${data.data.token_type} ${data.data.token}`;
    }
  }

  async getEnv(openid: string = ''): Promise<{ txt: string; list: Env[] }> {
    await this.getToken();

    const { data } = await axios.get(`${this.baseUrl}/envs?searchValue=${openid}&`, {
      headers: { Authorization: this.token },
    });
    const list = (data?.data || []) as Env[];
    if (!list.length) return { txt: '暂无您的jd cookie或您无权限查看', list: [] };

    const results = await Promise.all(
      list.map(async (item) => {
        const isLogin = await this.checkIsLogin(item.value);
        const txt = `序号:${item.id},备注名称:${item.remarks.split('&')[0]},状态:${item.status ? '禁用状态' : '未禁用状态'},登录状态:${
          isLogin === '1' ? 'ck有效' : 'ck已失效'
        }\n`;
        // const obj = {
        //   id: item.id,
        //   remarks: item.remarks.split('&')[0],
        //   status: item.status,
        // };
        return { txt };
      }),
    );

    const txt = results.map((result) => result.txt).join('');
    return { txt, list };
  }

  async checkIsLogin(ck: string) {
    const { data } = await axios.get('https://plogin.m.jd.com/cgi-bin/ml/islogin', {
      headers: {
        Cookie: ck,
        referer: 'https://h5.m.jd.com/',
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      },
    });
    // 1:登录 0:未登录
    return data?.islogin;
  }

  async addEnv(cookie: string, openid: string) {
    const pt_key = cookie.match(/pt_key=(.*?);/)[1];
    const pt_pin = cookie.match(/pt_pin=(.*?);/)[1];
    if (!pt_key || !pt_pin) return 'cookie格式错误咯~';
    try {
      await this.getToken();
      const ck = `pt_key=${pt_key};pt_pin=${pt_pin};`;
      const body = [
        {
          value: ck,
          name: 'JD_COOKIE',
          remarks: pt_pin + '&' + openid,
        },
      ];
      const { data } = await axios.post(`${this.baseUrl}/envs`, body, {
        headers: { Authorization: this.token },
      });
      if (data.code === 200) {
        return '添加成功';
      }
    } catch (e) {
      return '哇哦~系统出错啦，要不你在试试😁';
    }
  }

  async updateEnv(openid: string, handleTxt: string) {
    const [handle, id, ck = ''] = handleTxt.split(':');
    let ckStr = '';
    if (ck) {
      const pt_key = ck?.match(/pt_key=(.*?);/)[1];
      const pt_pin = ck?.match(/pt_pin=(.*?);/)[1];
      if (!pt_key || !pt_pin) return 'cookie格式错误咯~';
      ckStr = `pt_key=${pt_key};pt_pin=${pt_pin};`;
    }

    await this.getToken();

    const list = (await this.getEnv(openid)).list;
    if (!list.length) return '暂无您的jd cookie或您无权限操作';
    const whiteList = list.map((item) => item.id);
    const reqId = id.split(',');
    // 取出reqId和whiteList的交集(有权限操作)
    const ids = reqId.filter((item) => whiteList.includes(Number(item)));
    // 取出reqId和whiteList的差集(无权限操作)
    const noIds = reqId.filter((item) => !whiteList.includes(Number(item)));
    if (ids.length === 0) return '哇哦~你在干啥子哦~';
    const { id: _id, name, remarks } = list.filter((it) => it.id === Number(id))[0] as any;

    try {
      const { data } = await axios({
        url: `${this.baseUrl}/envs`,
        method: handle === '更新' ? 'put' : 'delete',
        data:
          handle === '更新'
            ? {
                id: _id,
                name,
                remarks,
                value: ckStr,
              }
            : ids,
        headers: { Authorization: this.token },
      });
      if (data.code === 200) {
        return `序号${ids.join(',')}${handle}成功${noIds.length ? `,序号${noIds.join(',')}你无权操作` : ''}`;
      }
    } catch (e) {
      console.log('e', e);
      return '哇哦~系统出错啦，要不你在试试😁';
    }
  }

  async updateStatus(openid: string, handleTxt: string) {
    const [handle, id] = handleTxt.split(':');
    const list = (await this.getEnv(openid)).list;
    if (!list.length) return '暂无您的jd cookie或您无权限操作';
    const whiteList = list.map((item) => item.id);
    const reqId = id.split(',');
    // 取出reqId和whiteList的交集(有权限操作)
    const ids = reqId.filter((item) => whiteList.includes(Number(item)));
    // 取出reqId和whiteList的差集(无权限操作)
    const noIds = reqId.filter((item) => !whiteList.includes(Number(item)));
    if (ids.length === 0) return '哇哦~你在干啥子哦~';
    const url = handle === '启用' ? '/envs/enable' : '/envs/disable';
    const { data } = await axios.put(`${this.baseUrl}${url}`, ids, {
      headers: { Authorization: this.token },
    });
    if (data.code === 200) {
      return `序号${ids.join(',')}${handle}成功${noIds.length ? `,序号${noIds.join(',')}你无权操作` : ''}`;
    }
    return '哇哦~系统出错啦，要不你在试试😁';
  }

  // 生成随机码
  async generateRandomCode(openid: string) {
    const code = Math.random().toString(36).slice(-6);
    await this.redis.set(code, `${openid}`, 'EX', 60 * 10);
    return `点击链接查看资产状况(链接10分钟内有效): https://wx.yujincheng.cn/ql/${code}`;
  }

  // 获取账号资产
  async getBean(code: string, res: Response) {
    let str = '';
    // 根据code获取openid
    const openid = await this.redis.get(code);
    if (!openid)
      return res.status(200).send(`
    <html>
      <style>*{font-size:22px;}</style>
      <body>
        <pre>连接已失效，请重新获取</pre>
      </body>
    </html>
`);
    // 获取当前用户的所有cookie
    const ckList = await this.getEnv(openid);
    if (!ckList.list.length)
      return res.status(200).send(`
    <html>
      <style>*{font-size:22px;}</style>
      <body>
        <pre>暂无您的jd cookie信息</pre>
      </body>
    </html>
`);

    const pinList = ckList.list.map((item) => decodeURIComponent(item.value.match(/pt_pin=(.*?);/)[1]));
    const cache = await this.redis.get('jd_bean_log');
    if (!cache) {
      str = '暂无资产数据,可能还未到资产查询执行时间';
    } else {
      const { time, data } = JSON.parse(cache);
      str = '截止到' + new Date(time).toLocaleString() + '(非实时查询)\n\n';
      // 过滤出包含pinList的行

      const beanList = pinList.map((it) => data.filter((line) => line.includes(it))).flat();
      beanList.map((item) => {
        str += item;
      });
    }

    // res返回html
    res.status(200).send(`
        <html>
          <style>*{font-size:22px;}</style>
          <body>
            <pre>${str}</pre>
          </body>
        </html>
    `);
  }

  async log(data: string) {
    return await this.redis.set('jd_bean_log', JSON.stringify({ time: Date.now(), data: data.split('------\n') }));
  }
}
