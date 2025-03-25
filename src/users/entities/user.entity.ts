import { Case } from "src/cases/entities/case.entity";
import { DocumentModel } from "src/documents/entities/document.entity";
import { TimeEntry } from "src/time-entries/entities/time-entry.entity";

export enum UserRole {
    ADMIN = 'ADMIN',
    LAWYER = 'LAWYER',
  }
  
  export interface User {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
    updatedAt?: Date;
    
    cases?: Case[];
    timeEntries?: TimeEntry[];
    documents?: DocumentModel[];
  }
  
  export type UserWithRelations = User & {
    cases?: Case[];
    timeEntries?: TimeEntry[];
    documents?: DocumentModel[];
  };