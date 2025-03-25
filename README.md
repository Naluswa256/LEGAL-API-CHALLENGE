# API Documentation

## Overview
This document provides a comprehensive overview of the API endpoints, code structure, and database schema for the application.


## API Endpoints Documentation

### Authentication Routes (`/api/v1/auth`)
| Method | Endpoint                     | Description                                                                 | Request Body                                                                 | Required Role | Status Codes               |
|--------|------------------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------|---------------|----------------------------|
| POST   | `/api/v1/auth/register`      | Register a new user                                                         | `{ email: string, password: string, fullName: string }`                      | None          | 201 Created, 400 Bad Request |
| POST   | `/api/v1/auth/login`         | Authenticate user and return JWT tokens                                     | `{ email: string, password: string }`                                        | None          | 200 OK, 401 Unauthorized   |
| POST   | `/api/v1/auth/refresh-token` | Refresh access token using refresh token                                    | `{ refreshToken: string }`                                                   | None          | 200 OK, 401 Unauthorized   |

### Case Management Routes (`/api/v1/cases`)
| Method | Endpoint                         | Description                                                                 | Query Parameters                          | Required Role       | Status Codes               |
|--------|----------------------------------|-----------------------------------------------------------------------------|------------------------------------------|---------------------|----------------------------|
| POST   | `/api/v1/cases`                 | Create a new case                                                          | None                                      | LAWYER              | 201 Created, 400 Bad Request |
| GET    | `/api/v1/cases`                 | List all cases (filterable and paginated)                                  | `status`, `clientName`, `page`, `limit`, `sort` | ADMIN, LAWYER       | 200 OK                     |
| GET    | `/api/v1/cases/search`          | Search cases by client name or email                                       | `q` (search term), `status`, `sort`      | ADMIN, LAWYER       | 200 OK                     |
| GET    | `/api/v1/cases/:id`             | Get case details                                                           | None                                      | ADMIN, LAWYER       | 200 OK, 404 Not Found      |
| GET    | `/api/v1/cases/:id/time-entries`| Get all time entries for a case                                            | None                                      | ADMIN, LAWYER       | 200 OK                     |
| GET    | `/api/v1/cases/:id/total-hours` | Get total billable hours for a case                                        | None                                      | ADMIN, LAWYER       | 200 OK                     |
| PUT    | `/api/v1/cases/:id`             | Update case details                                                        | None                                      | LAWYER              | 200 OK, 403 Forbidden      |
| PUT    | `/api/v1/cases/:id/status`      | Update case status                                                         | `status` (query param)                   | ADMIN, LAWYER       | 200 OK                     |
| DELETE | `/api/v1/cases/:id`             | Delete a case                                                              | None                                      | ADMIN, LAWYER       | 204 No Content             |

### Time Entry Routes (`/api/v1/cases/:caseId/time-entries`)
| Method | Endpoint                                      | Description                                                                 | Request Body                              | Required Role       | Status Codes               |
|--------|-----------------------------------------------|-----------------------------------------------------------------------------|------------------------------------------|---------------------|----------------------------|
| POST   | `/api/v1/cases/:caseId/time-entries`         | Create a new time entry                                                     | `{ hours: number, description: string }` | LAWYER              | 201 Created               |
| GET    | `/api/v1/cases/:caseId/time-entries`         | List all time entries (filterable)                                         | `hours`, `page`, `limit`, `sort`         | ADMIN, LAWYER       | 200 OK                     |
| GET    | `/api/v1/cases/:caseId/time-entries/total-hours` | Get total hours for case                                                | None                                      | ADMIN, LAWYER       | 200 OK                     |
| GET    | `/api/v1/cases/:caseId/time-entries/:id`     | Get specific time entry                                                     | None                                      | ADMIN, LAWYER       | 200 OK                     |
| PUT    | `/api/v1/cases/:caseId/time-entries/:id`     | Update time entry                                                           | `{ hours?: number, description?: string }` | LAWYER              | 200 OK                     |
| DELETE | `/api/v1/cases/:caseId/time-entries/:id`     | Delete time entry                                                           | None                                      | ADMIN, LAWYER       | 204 No Content             |

### Document Routes (`/api/v1/cases/:caseId/documents`)
| Method | Endpoint                                | Description                                                                 | File/Form Data                           | Required Role       | Status Codes               |
|--------|-----------------------------------------|-----------------------------------------------------------------------------|------------------------------------------|---------------------|----------------------------|
| POST   | `/api/v1/cases/:caseId/documents`      | Upload a document (max 10MB, PDF/DOCX)                                      | `file` (binary), `description?: string`  | LAWYER              | 201 Created               |
| GET    | `/api/v1/cases/:caseId/documents`      | List all documents for a case                                               | None                                      | ADMIN, LAWYER       | 200 OK                     |
| DELETE | `/api/v1/cases/:caseId/documents/:id`  | Delete a document                                                           | None                                      | ADMIN, LAWYER       | 204 No Content             |

### Public Document Routes (`/api/v1/public/documents`)
| Method | Endpoint                     | Description                                                                 | Required Role       | Status Codes               |
|--------|------------------------------|-----------------------------------------------------------------------------|---------------------|----------------------------|
| GET    | `/api/v1/public/documents/:id` | Download/view a document (inline content-disposition)                      | ADMIN, LAWYER       | 200 OK, 404 Not Found      |


### Document Upload
**Request:**
```http
POST /api/v1/cases/550e8400-e29b-41d4-a716-446655440000/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

[file binary data]
```




---

# API Test Credentials

The following test accounts are pre-seeded in the system for development and testing purposes:

## Admin Account
- **Email**: `admin@legaltech.com`  
- **Password**: `admin123`  
- **Role**: `ADMIN`  
- **User ID**: `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`

## Attorney Account
- **Email**: `attorney@legaltech.com`  
- **Password**: `attorney123`  
- **Role**: `LAWYER`  
- **User ID**: `ef2e401d-5ecb-46be-9571-87c8256600bf`

## Usage Instructions

### 1. **Obtain JWT Token**

To obtain a JWT token, make a POST request to the authentication endpoint:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@legaltech.com",
  "password": "admin123"
}
```

### 2. **Use JWT Token in API Requests**

Once you have obtained the JWT token, you can use it in the `Authorization` header for subsequent API requests. For example, to fetch cases:

```http
GET /api/v1/cases
Authorization: Bearer <your_jwt_token>
```

---


## Getting Started

Follow these steps to get the application up and running on your local machine:

### 1. **Install Dependencies**

First, install the required dependencies:

```bash
npm install
```

### 2. **Configure Environment Variables**

Next, set up the environment variables by creating a `.env` file. You can copy the example configuration:

```bash
cp .env.example .env
```

### 3. **Run the Application**

Now, you're ready to run the application in development mode:

```bash
npm run start:dev
```

This will start the application and you should be able to access it at the specified local URL.

---


## Architecture

```
src/
├── cases/                # Case management
├── documents/            # Document handling
├── time-entries/         # Time tracking
├── users/                # User management
├── prisma/               # Database service
└── shared/               # DTOs, interfaces, etc.

```

```markdown
# Legal Case Management System

A NestJS-based backend system for managing legal cases, attorneys, clients, time entries, and documents.

## Key Features

### 1. Robust Data Operations

#### Pagination, Filtering, and Sorting
Implemented comprehensive data querying capabilities in the Prisma service:

```typescript
// Example of findManyCases with all query options
findManyCases(params?: {
  where?: any;              // Filter conditions
  include?: any;            // Relations to include
  skip?: number;           // Pagination offset
  take?: number;           // Page size
  orderBy?: any;          // Sorting criteria
}): CaseWithRelations[] {
  // Implementation handles:
  // - Complex filtering with AND/OR conditions
  // - Multi-field sorting
  // - Offset-based pagination
}
```


```

### 2. Validation with DTOs

Implemented robust validation using class-validator decorators:

```typescript
// create-case.dto.ts
export class CreateCaseDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  clientName: string;

  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;
}

// Custom validation decorator example
@ValidatorConstraint({ async: false })
export class IsValidCaseStatusConstraint implements ValidatorConstraintInterface {
  validate(status: string) {
    return Object.values(CaseStatus).includes(status);
  }
}
```

### 3. Document Uploads with Multer

Implemented secure file uploads:

```typescript
// documents.controller.ts
@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(pdf|docx)$/)) {
      return cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}))
async uploadDocument(
  @UploadedFile() file: Express.Multer.File,
  @Body() createDocumentDto: CreateDocumentDto
) {
  // File metadata saved with case association
}
```

File upload requirements:
- Max size: 10MB
- Allowed formats: PDF, DOCX
- Saved to: `/uploads` with unique filenames
- Associated with cases via `caseId`

### 4. Comprehensive Service Layer

The CasesService implements:
- Authorization checks
- Business logic validation
- Transactional operations
- Error handling

```typescript
// Example service method with validation
async createCase(createCaseDto: CreateCaseDto, user: User) {
  // Verify user is a valid attorney
  const lawyer = await this.prisma.findUserById(user.id);
  if (!lawyer || lawyer.role !== UserRole.LAWYER) {
    throw new BadRequestException('Invalid attorney credentials');
  }

  // Validate client email doesn't have existing open case
  const existingCase = await this.prisma.findManyCases({
    where: {
      clientEmail: createCaseDto.clientEmail,
      status: CaseStatus.OPEN
    }
  });

  if (existingCase.length > 0) {
    throw new ConflictException('Open case already exists for this client');
  }

  // Create the case
  return this.prisma.createCase({
    lawyerId: user.id,
    ...createCaseDto
  });
}


## Testing

Run unit tests:
```bash
npm test
```

Run e2e tests:
```bash
npm run test:e2e
```

## Deployment

1. Build production version:
```bash
npm run build
```

2. Start server:
```bash
node dist/main.js
```

For production, consider using:
- Process manager (PM2)
- Reverse proxy (Nginx)
- File storage service (AWS S3 for uploads)
```
---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String     @id @default(uuid())
  fullName     String
  email        String     @unique
  passwordHash String
  role         Role       @default(LAWYER)
  cases        Case[]
  timeEntries  TimeEntry[]
  documents    Document[]
  createdAt    DateTime   @default(now())
  
  @@map("users")
}

model Case {
  id          String     @id @default(uuid())
  lawyer      User       @relation(fields: [lawyerId], references: [id])
  lawyerId    String
  clientName  String
  clientEmail String
  status      CaseStatus @default(OPEN)
  timeEntries TimeEntry[]
  documents   Document[]
  createdAt   DateTime   @default(now())

  @@map("cases")
}

model TimeEntry {
  id       String   @id @default(uuid())
  case     Case     @relation(fields: [caseId], references: [id])
  caseId   String
  hours    Int
  details  String
  createdAt DateTime @default(now())

  @@map("time_entries")
}

model Document {
  id       String   @id @default(uuid())
  case     Case     @relation(fields: [caseId], references: [id])
  caseId   String
  url      String
  createdAt DateTime @default(now())

  @@map("documents")
}

enum Role {
  ADMIN
  LAWYER
}

export enum CaseStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  IN_REVIEW = 'IN_REVIEW',
  PENDING = 'PENDING',
}
```

---

### Authentication and Authorization in the API

This project uses JWT-based authentication for secure access to endpoints. The **JwtAuthGuard** ensures that only authenticated users can access certain routes, while the **RolesGuard** enforces role-based authorization, allowing only users with specific roles to access restricted routes.

#### **1. JwtAuthGuard**
The `JwtAuthGuard` is responsible for checking if the request has a valid JWT token. It ensures that only authenticated users can access routes that require authentication.

```typescript
import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActivated = (await super.canActivate(context)) as boolean;
    if (!isActivated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    return true;
  }
}
```

- **Usage**: This guard is typically applied globally or on specific routes to ensure users are authenticated before accessing the endpoint.
- **Flow**: The guard extracts the JWT token from the request's authorization header and validates it. If the token is invalid or expired, the user will receive an `UnauthorizedException`.

#### **2. RolesGuard**
The `RolesGuard` ensures that the user has the required role to access specific routes. It's built to protect routes based on user roles.

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    // No roles required = public access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`User with role ${user.role} not authorized to access this route`);
    }

    return true;
  }
}
```

- **Usage**: This guard is used in combination with route decorators (`@Roles()`) to specify which roles are allowed to access a route.
- **Flow**: The guard checks the user's role against the required roles stored in the route metadata. If the user's role doesn't match the required role, it throws a `ForbiddenException`.

#### **3. JWT Strategy**
The `JwtStrategy` validates the JWT token and extracts the user information from the token's payload. It is used by the `JwtAuthGuard` to authenticate requests.

```typescript
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtDto } from './dto/jwt.dto';
import { PrismaService } from 'src/prisma_database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtDto) {
    console.log('🔹 Validating JWT Payload:', payload);
    const user = this.prisma.findUserById(payload.userId);
    
    if (!user) {
      console.error('❌ User not found for ID:', payload.userId);
      throw new UnauthorizedException('User not found');
    }

    console.log('✅ User authenticated:', user.id);
    return user;
  }
}
```

- **Usage**: This strategy is applied automatically when using the `JwtAuthGuard` for authentication. It ensures that the user exists in the database and is valid.
- **Flow**: The strategy extracts the JWT token from the authorization header, verifies the signature, and retrieves the user based on the ID in the payload.

### **Protecting Routes**

Routes can be protected by using the `JwtAuthGuard` and `RolesGuard`. Below are examples of how to apply these guards to protect routes.

#### **Example Route Protection**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller('user')
export class UserController {

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile() {
    // Only authenticated users can access this route
    return { message: 'Profile data' };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admin users can access this route
  getAdminData() {
    // Only users with the 'admin' role can access this route
    return { message: 'Admin data' };
  }
}
```

### **Summary of Protected Routes**

- **Public Routes**: No guard applied, anyone can access.
- **Protected Routes**: Use `@UseGuards(JwtAuthGuard)` for routes that require authentication.
- **Role-based Routes**: Use `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('role')` to restrict access to specific roles.


## Implementation Notes

### Prisma Service Design

**Fixed UUIDs for Testing:**
```typescript
private seedData() {
  // Using fixed UUIDs for reliable testing
  const adminUserId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
  const attorneyUserId = 'ef2e401d-5ecb-46be-9571-87c8256600bf';
  
  // Seeded entities use these fixed IDs for relationships
  const sampleCase: Case = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    lawyerId: attorneyUserId, // Reference to fixed attorney ID
    // ... other fields
  };
}
```

**Key Testing IDs:**
| Entity        | Fixed ID                                  |
|---------------|------------------------------------------|
| Admin User    | 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d    |
| Attorney User | ef2e401d-5ecb-46be-9571-87c8256600bf     |
| Sample Case   | 550e8400-e29b-41d4-a716-446655440000     |

**Why Fixed IDs?**
- Ensures consistent relationships during development
- Simplifies testing with predictable references
- Avoids dynamic ID generation complexities in mock implementation

### Current Implementation Limitations

1. **Data Persistence:**
   - In-memory storage only (data lost on server restart)
   - No proper database integration




