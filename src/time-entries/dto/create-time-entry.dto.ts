
import { IsString, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateTimeEntryDto {

  @IsString()
  @IsNotEmpty()
  caseId: string;
  @IsNumber()
  @Min(0.1)
  @Max(24)
  hours: number;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsString()
  @IsNotEmpty()
  workDate?: string;
}