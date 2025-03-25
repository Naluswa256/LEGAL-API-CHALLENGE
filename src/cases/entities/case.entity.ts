import { DocumentModel } from "src/documents/entities/document.entity";
import { TimeEntry } from "src/time-entries/entities/time-entry.entity";
import { User } from "src/users/entities/user.entity";

export enum CaseStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  IN_REVIEW = 'IN_REVIEW',
  PENDING = 'PENDING',
}

export interface Case {
  id: string;
  lawyerId: string;
  clientName: string;
  clientEmail: string;
  status: CaseStatus;
  notes?: string;
  createdAt: Date;
  

  lawyer?: User;
  timeEntries?: TimeEntry[];
  documents?: DocumentModel[];
}

export type CaseWithRelations = Case & {
  lawyer?: User;
  timeEntries?: TimeEntry[];
  documents?: DocumentModel[];
};