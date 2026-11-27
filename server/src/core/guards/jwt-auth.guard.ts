import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      try {
        const result = super.canActivate(context);
        if (result instanceof Promise) {
          await result;
        } else if (result && typeof (result as any).subscribe === 'function') {
          await new Promise<void>((resolve) => {
            (result as any).subscribe({
              next: () => resolve(),
              error: () => resolve(),
              complete: () => resolve(),
            });
          });
        }
      } catch {
        // Public route allows guest access without valid token
      }
      return true;
    }

    return super.canActivate(context) as any;
  }
}
