import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthGuard as AuthGuardPassport } from '@nestjs/passport';

@Injectable()
export class AuthGuard extends AuthGuardPassport('jwt') implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
