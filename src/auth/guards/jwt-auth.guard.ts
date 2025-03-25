
import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
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