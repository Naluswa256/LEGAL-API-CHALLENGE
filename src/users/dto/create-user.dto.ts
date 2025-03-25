
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/, {
    message: 'Password too weak',
  })
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;
}
