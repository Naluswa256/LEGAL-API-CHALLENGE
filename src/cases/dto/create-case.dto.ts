
import { IsString, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clientName: string;
  @IsEmail()
  @IsNotEmpty()
  clientEmail: string;
  @IsString()
  notes?: string;
}