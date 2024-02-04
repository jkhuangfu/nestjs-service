export class Ql {}

export class Env {
  id: number;
  /** jd cookie */
  value: string;
  timestamp: string;
  status: number;
  position: number;
  name: string;
  /** 备注 */
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export class Info {
  id: number;
  remarks: string;
  status: string;
}

export class XmlResult {
  tousername: string[];
  fromusername: string[];
  createtime: string[];
  msgtype: string[];
  content: string[];
  msgid: string[];
  encrypt: string[];
}
