import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GiftSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  billingCycle: 'monthly' | 'yearly';

  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @IsOptional()
  giftMessage?: string;

  @IsUUID()
  @IsNotEmpty()
  purchaserId: string;

  @IsString()
  @IsNotEmpty()
  purchaserName: string;
}

export class RedeemGiftDto {
  @IsString()
  @IsNotEmpty()
  giftCode: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
