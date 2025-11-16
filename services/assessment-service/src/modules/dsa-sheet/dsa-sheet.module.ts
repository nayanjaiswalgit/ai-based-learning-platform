import { Module } from '@nestjs/common';
import { DsaSheetService } from './dsa-sheet.service';
import { DsaSheetController } from './dsa-sheet.controller';

@Module({
  controllers: [DsaSheetController],
  providers: [DsaSheetService],
  exports: [DsaSheetService],
})
export class DsaSheetModule {}
