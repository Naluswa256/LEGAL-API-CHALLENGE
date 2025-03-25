
import { IsNumber, IsOptional, Min, Max, IsIn } from 'class-validator';

import { Transform } from 'class-transformer';



export class TimeEntryQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.1)
  @Max(24)
  hours?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const [orderBy, orderDir] = value.split(':');
    return {
      orderBy: ['createdAt', 'hours', 'workDate'].includes(orderBy) 
        ? orderBy as 'createdAt' | 'hours' | 'workDate' 
        : 'createdAt',
      orderDir: ['asc', 'desc'].includes(orderDir?.toLowerCase()) 
        ? orderDir.toLowerCase() as 'asc' | 'desc' 
        : 'desc'
    };
  })
  sort?: {
    orderBy: 'createdAt' | 'hours' | 'workDate';
    orderDir: 'asc' | 'desc';
  };

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}