
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { CaseStatus } from '../entities/case.entity';


export class UpdateCaseDto {

  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}