// Local type definitions (not in Prisma schema yet)
export enum EmailTemplateType {
  WELCOME = 'WELCOME',
  PASSWORD_RESET = 'PASSWORD_RESET',
  VERIFICATION = 'VERIFICATION',
  NOTIFICATION = 'NOTIFICATION',
}

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export enum ScheduledStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CANCELLED = 'CANCELLED',
}
