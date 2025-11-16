import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-saml';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(private configService: ConfigService) {
    super({
      entryPoint: configService.get<string>('SAML_ENTRY_POINT'),
      issuer: configService.get<string>('SAML_ISSUER'),
      cert: configService.get<string>('SAML_CERT'),
      wantAssertionsSigned: true,
      signatureAlgorithm: 'sha256',
    });
  }

  async validate(profile: Profile): Promise<any> {
    const { nameID, email, firstName, lastName } = profile as any;

    return {
      provider: 'saml',
      providerId: nameID,
      email: email || nameID,
      firstName,
      lastName,
    };
  }
}
