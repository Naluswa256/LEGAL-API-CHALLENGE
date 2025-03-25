
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );
  
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
        throw new ForbiddenException(
          `User with role ${user.role} not authorized to access this route`,
        );
      }
  
      return true;
    }
  }