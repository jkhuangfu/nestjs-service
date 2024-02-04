import { IsString, IsNumber, IsNotEmpty, Length } from 'class-validator';
export class CreateLoginDto {
  @IsNotEmpty()
  @IsString({ message: '姓名为字符串' })
  @Length(2, 10, { message: '姓名长度为2-10个字符' })
  name: string;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: '年龄为数字' })
  age: number;
}
