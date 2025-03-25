// src/prisma/prisma.service.ts

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { TimeEntry, TimeEntryWithRelations } from 'src/time-entries/entities/time-entry.entity';
import { User, UserRole, UserWithRelations } from 'src/users/entities/user.entity';
import { Case, CaseStatus, CaseWithRelations } from 'src/cases/entities/case.entity';
import { DocumentModel, DocumentWithRelations } from 'src/documents/entities/document.entity';



@Injectable()
export class PrismaService {
  private users: User[] = [];
  private cases: Case[] = [];
  private timeEntries: TimeEntry[] = [];
  private documents: DocumentModel[] = [];

  constructor() {
    this.seedData();
  }


private seedData() {
  const adminUserId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'; 
  const attorneyUserId = 'ef2e401d-5ecb-46be-9571-87c8256600bf';

  // Clear existing data
  this.users = [];
  this.cases = [];
  this.timeEntries = [];
  this.documents = [];

  const adminUser: User = {
    id: adminUserId,
    fullName: 'Admin User',
    email: 'admin@legaltech.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: UserRole.ADMIN,
    createdAt: new Date(),
  };
  const attorneyUser: User = {
    id: attorneyUserId,
    fullName: 'Attorney User',
    email: 'attorney@legaltech.com',
    passwordHash: bcrypt.hashSync('attorney123', 10),
    role: UserRole.LAWYER, 
    createdAt: new Date(),
  };

  this.users.push(adminUser, attorneyUser);
  const sampleCase: Case = {
    id: '550e8400-e29b-41d4-a716-446655440000', 
    lawyerId: attorneyUserId, 
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    status: CaseStatus.OPEN,
    createdAt: new Date(),
  };
  this.cases.push(sampleCase);

  const sampleTimeEntry: TimeEntry = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    caseId: sampleCase.id,
    lawyerId: attorneyUserId,
    hours: 2.5,
    description: 'Initial client consultation',
    createdAt: new Date(),
  };
  this.timeEntries.push(sampleTimeEntry);
  const sampleDocument: DocumentModel = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    caseId: sampleCase.id,
    lawyerId: attorneyUserId,
    fileName: 'contract.pdf',
    fileUrl: 'https://storage.example.com/contract.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    description: 'Client engagement contract',
    createdAt: new Date(),
  };
  this.documents.push(sampleDocument);
}
  // ========== User Operations ==========
  findManyUsers(params?: {
    where?: any;
    include?: any;
    skip?: number;
    take?: number;
    orderBy?: any;
  }): UserWithRelations[] {
    let results = this.users;

    // Filtering
    if (params?.where) {
      results = results.filter(user => {
        return Object.entries(params.where).every(([key, value]) => {
          if (key === 'OR') {
            return (value as any[]).some(condition =>
              Object.entries(condition).every(([k, v]) => user[k] === v)
            );
          }
          return user[key as keyof User] === value;
        });
      });
    }

    // Sorting
    if (params?.orderBy) {
      const [field, direction] = Object.entries(params.orderBy)[0];
      results.sort((a, b) => {
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    if (params?.skip) results = results.slice(params.skip);
    if (params?.take) results = results.slice(0, params.take);

    // Relationships
    return results.map(user => ({
      ...user,
      cases: params?.include?.cases ? this.findCasesByLawyer(user.id) : undefined,
      timeEntries: params?.include?.timeEntries
        ? this.findTimeEntriesByLawyer(user.id)
        : undefined,
      documents: params?.include?.documents
        ? this.findDocumentsByLawyer(user.id)
        : undefined,
    }));
  }

  findUserById(id: string, include?: any): UserWithRelations | null {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;

    return {
      ...user,
      ...(include?.cases && { cases: this.findCasesByLawyer(user.id) }),
      ...(include?.timeEntries && {
        timeEntries: this.findTimeEntriesByLawyer(user.id),
      }),
      ...(include?.documents && {
        documents: this.findDocumentsByLawyer(user.id),
      }),
    };
  }

  createUser(data: Omit<User, 'id' | 'createdAt'>): User {
    if (this.users.some(u => u.email === data.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, data: Partial<User>): User {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    if (data.email && this.users.some(u => u.email === data.email && u.id !== id)) {
      throw new Error('Email already in use by another user');
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...data,
    };
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  deleteUser(id: string): User {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Check if user has associated records
    if (this.cases.some(c => c.lawyerId === id)) {
      throw new Error('Cannot delete user with associated cases');
    }

    const [deletedUser] = this.users.splice(userIndex, 1);
    return deletedUser;
  }

  // ========== Case Operations ==========
  findManyCases(params?: {
    where?: any;
    include?: any;
    skip?: number;
    take?: number;
    orderBy?: any;
  }): CaseWithRelations[] {
    let results = this.cases;

    // Filtering
    if (params?.where) {
      results = results.filter(c => {
        return Object.entries(params.where).every(([key, value]) => {
          if (key === 'OR') {
            return (value as any[]).some(condition =>
              Object.entries(condition).every(([k, v]) => c[k] === v)
            );
          }
          return c[key as keyof Case] === value;
        });
      });
    }

    // Sorting
    if (params?.orderBy) {
      const [field, direction] = Object.entries(params.orderBy)[0];
      results.sort((a, b) => {
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    if (params?.skip) results = results.slice(params.skip);
    if (params?.take) results = results.slice(0, params.take);

    // Relationships
    return results.map(c => ({
      ...c,
      lawyer: params?.include?.lawyer ? this.findUserById(c.lawyerId) : undefined,
      timeEntries: params?.include?.timeEntries
        ? this.findTimeEntriesByCase(c.id)
        : undefined,
      documents: params?.include?.documents
        ? this.findDocumentsByCase(c.id)
        : undefined,
    }));
  }

  findCaseById(id: string, include?: any): CaseWithRelations | null {
    const caseItem = this.cases.find(c => c.id === id);
    if (!caseItem) return null;

    return {
      ...caseItem,
      ...(include?.lawyer && { lawyer: this.findUserById(caseItem.lawyerId) }),
      ...(include?.timeEntries && {
        timeEntries: this.findTimeEntriesByCase(caseItem.id),
      }),
      ...(include?.documents && {
        documents: this.findDocumentsByCase(caseItem.id),
      }),
    };
  }

  createCase(data: Omit<Case, 'id' | 'createdAt' | 'status'>): Case {
    if (!this.users.some(u => u.id === data.lawyerId && u.role === UserRole.LAWYER)) {
      throw new Error('Lawyer not found or not a valid attorney');
    }

    const newCase: Case = {
      ...data,
      id: uuidv4(),
      status: CaseStatus.OPEN,
      createdAt: new Date(),
    };
    this.cases.push(newCase);
    return newCase;
  }

  updateCase(id: string, data: Partial<Case>): Case {
    const caseIndex = this.cases.findIndex(c => c.id === id);
    if (caseIndex === -1) {
      throw new Error('Case not found');
    }

    if (data.lawyerId && !this.users.some(u => u.id === data.lawyerId)) {
      throw new Error('Lawyer not found');
    }

    const updatedCase = {
      ...this.cases[caseIndex],
      ...data,
    };
    this.cases[caseIndex] = updatedCase;
    return updatedCase;
  }

  deleteCase(id: string): Case {
    const caseIndex = this.cases.findIndex(c => c.id === id);
    if (caseIndex === -1) {
      throw new Error('Case not found');
    }

    // Check if case has associated records
    if (this.timeEntries.some(te => te.caseId === id)) {
      throw new Error('Cannot delete case with associated time entries');
    }

    if (this.documents.some(d => d.caseId === id)) {
      throw new Error('Cannot delete case with associated documents');
    }

    const [deletedCase] = this.cases.splice(caseIndex, 1);
    return deletedCase;
  }

  // ========== TimeEntry Operations ==========
  findManyTimeEntries(params?: {
    where?: any;
    include?: any;
    skip?: number;
    take?: number;
    orderBy?: any;
  }): TimeEntryWithRelations[] {
    let results = this.timeEntries;

    // Filtering
    if (params?.where) {
      results = results.filter(te => {
        return Object.entries(params.where).every(([key, value]) => {
          if (key === 'OR') {
            return (value as any[]).some(condition =>
              Object.entries(condition).every(([k, v]) => te[k] === v)
            );
          }
          return te[key as keyof TimeEntry] === value;
        });
      });
    }

    // Sorting
    if (params?.orderBy) {
      const [field, direction] = Object.entries(params.orderBy)[0];
      results.sort((a, b) => {
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    if (params?.skip) results = results.slice(params.skip);
    if (params?.take) results = results.slice(0, params.take);

    // Relationships
    return results.map(te => ({
      ...te,
      case: params?.include?.case ? this.findCaseById(te.caseId) : undefined,
      lawyer: params?.include?.lawyer ? this.findUserById(te.lawyerId) : undefined,
    }));
  }

  findTimeEntryById(id: string, include?: any): TimeEntryWithRelations | null {
    const timeEntry = this.timeEntries.find(te => te.id === id);
    if (!timeEntry) return null;

    return {
      ...timeEntry,
      ...(include?.case && { case: this.findCaseById(timeEntry.caseId) }),
      ...(include?.lawyer && { lawyer: this.findUserById(timeEntry.lawyerId) }),
    };
  }

  createTimeEntry(data: Omit<TimeEntry, 'id' | 'createdAt'>): TimeEntry {
    if (!this.cases.some(c => c.id === data.caseId)) {
      throw new Error('Case not found');
    }

    if (!this.users.some(u => u.id === data.lawyerId)) {
      throw new Error('Lawyer not found');
    }

    const newTimeEntry: TimeEntry = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };
    this.timeEntries.push(newTimeEntry);
    return newTimeEntry;
  }

  updateTimeEntry(id: string, data: Partial<TimeEntry>): TimeEntry {
    const timeEntryIndex = this.timeEntries.findIndex(te => te.id === id);
    if (timeEntryIndex === -1) {
      throw new Error('Time entry not found');
    }

    if (data.caseId && !this.cases.some(c => c.id === data.caseId)) {
      throw new Error('Case not found');
    }

    if (data.lawyerId && !this.users.some(u => u.id === data.lawyerId)) {
      throw new Error('Lawyer not found');
    }

    const updatedTimeEntry = {
      ...this.timeEntries[timeEntryIndex],
      ...data,
    };
    this.timeEntries[timeEntryIndex] = updatedTimeEntry;
    return updatedTimeEntry;
  }

  deleteTimeEntry(id: string): TimeEntry {
    const timeEntryIndex = this.timeEntries.findIndex(te => te.id === id);
    if (timeEntryIndex === -1) {
      throw new Error('Time entry not found');
    }

    const [deletedTimeEntry] = this.timeEntries.splice(timeEntryIndex, 1);
    return deletedTimeEntry;
  }

  // ========== Document Operations ==========
  findManyDocuments(params?: {
    where?: any;
    include?: any;
    skip?: number;
    take?: number;
    orderBy?: any;
  }): DocumentWithRelations[] {
    let results = this.documents;

    // Filtering
    if (params?.where) {
      results = results.filter(d => {
        return Object.entries(params.where).every(([key, value]) => {
          if (key === 'OR') {
            return (value as any[]).some(condition =>
              Object.entries(condition).every(([k, v]) => d[k] === v)
            );
          }
          return d[key as keyof Document] === value;
        });
      });
    }

    // Sorting
    if (params?.orderBy) {
      const [field, direction] = Object.entries(params.orderBy)[0];
      results.sort((a, b) => {
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    if (params?.skip) results = results.slice(params.skip);
    if (params?.take) results = results.slice(0, params.take);

    // Relationships
    return results.map(d => ({
      ...d,
      case: params?.include?.case ? this.findCaseById(d.caseId) : undefined,
      lawyer: params?.include?.lawyer ? this.findUserById(d.lawyerId) : undefined,
    }));
  }

  findDocumentById(id: string, include?: any): DocumentWithRelations | null {
    const document = this.documents.find(d => d.id === id);
    if (!document) return null;

    return {
      ...document,
      ...(include?.case && { case: this.findCaseById(document.caseId) }),
      ...(include?.lawyer && { lawyer: this.findUserById(document.lawyerId) }),
    };
  }

  createDocument(data: Omit<DocumentModel, 'id' | 'createdAt'>): DocumentModel {
    if (!this.cases.some(c => c.id === data.caseId)) {
      throw new Error('Case not found');
    }

    if (!this.users.some(u => u.id === data.lawyerId)) {
      throw new Error('Lawyer not found');
    }

    const newDocument: DocumentModel = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };
    this.documents.push(newDocument);
    return newDocument;
  }

  updateDocument(id: string, data: Partial<DocumentModel>): DocumentModel {
    const documentIndex = this.documents.findIndex(d => d.id === id);
    if (documentIndex === -1) {
      throw new Error('Document not found');
    }

    if (data.caseId && !this.cases.some(c => c.id === data.caseId)) {
      throw new Error('Case not found');
    }

    if (data.lawyerId && !this.users.some(u => u.id === data.lawyerId)) {
      throw new Error('Lawyer not found');
    }

    const updatedDocument = {
      ...this.documents[documentIndex],
      ...data,
    };
    this.documents[documentIndex] = updatedDocument;
    return updatedDocument;
  }

  deleteDocument(id: string): DocumentModel {
    const documentIndex = this.documents.findIndex(d => d.id === id);
    if (documentIndex === -1) {
      throw new Error('Document not found');
    }

    const [deletedDocument] = this.documents.splice(documentIndex, 1);
    return deletedDocument;
  }

  // ========== Helper Methods ==========
  private findCasesByLawyer(lawyerId: string): Case[] {
    return this.cases.filter(c => c.lawyerId === lawyerId);
  }

  private findTimeEntriesByLawyer(lawyerId: string): TimeEntry[] {
    return this.timeEntries.filter(te => te.lawyerId === lawyerId);
  }

  private findDocumentsByLawyer(lawyerId: string): DocumentModel[] {
    return this.documents.filter(d => d.lawyerId === lawyerId);
  }

  private findTimeEntriesByCase(caseId: string): TimeEntry[] {
    return this.timeEntries.filter(te => te.caseId === caseId);
  }

  private findDocumentsByCase(caseId: string): DocumentModel[] {
    return this.documents.filter(d => d.caseId === caseId);
  }
}