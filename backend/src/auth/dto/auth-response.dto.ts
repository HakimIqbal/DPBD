import { User } from '../../entities';

export class AuthResponseDto {
  user: Partial<User>;
  access_token: string;
  expires_in: number;
}
