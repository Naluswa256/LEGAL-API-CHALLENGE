
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';


export class CreateDocumentDto {
  file: any;
  @IsString()
  @IsNotEmpty()
  caseId: string;
  @IsString()
  @IsOptional()
  description?: string;
}