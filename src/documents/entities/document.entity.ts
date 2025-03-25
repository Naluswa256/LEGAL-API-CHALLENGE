
import { Case } from '../../cases/entities/case.entity';
import { User } from '../../users/entities/user.entity';

export interface DocumentModel {
  id: string;
  caseId: string;
  lawyerId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  createdAt: Date;
  
  case?: Case;
  lawyer?: User;
}
export type DocumentWithRelations = DocumentModel & {
  case?: Case;
  lawyer?: User;
};