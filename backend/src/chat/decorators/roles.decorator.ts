import { ReflectableDecorator, Reflector } from '@nestjs/core';

export const Roles: ReflectableDecorator<string[], string[]> =
  Reflector.createDecorator<string[]>();
