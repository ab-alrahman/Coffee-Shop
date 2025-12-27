import { UserType } from './enum';

export type JwtPayloadType = {
  id: string;
  sub: string;
  userType: UserType;
};

export type AccessTokenType = {
  accessToken: string;
};
