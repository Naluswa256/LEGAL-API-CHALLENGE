
import { Case } from '../../cases/entities/case.entity';
import { User } from '../../users/entities/user.entity';

export interface TimeEntry {
  id: string;
  caseId: string;
  lawyerId: string;
  hours: number;
  description: string;
  createdAt: Date;
  
  case?: Case;
  lawyer?: User;
}

export type TimeEntryWithRelations = TimeEntry & {
  case?: Case;
  lawyer?: User;
};