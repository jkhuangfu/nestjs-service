import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString({ message: '姓名为字符串' })
  @Length(2, 10, { message: '姓名长度为2-10个字符' })
  name: string;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: '性别必须为数字' })
  @IsIn([0, 1], { message: '性别只能为0或1' })
  sex: number;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: '年龄必须为数字' })
  @Min(0, { message: '年龄不能小于0' })
  age: number;
}
