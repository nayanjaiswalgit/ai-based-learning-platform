import { Module } from '@nestjs/common';
import { CoursesController } from './controllers/courses.controller';
import { ModulesController } from './controllers/modules.controller';
import { LessonsController } from './controllers/lessons.controller';
import { BundlesController } from './controllers/bundles.controller';
import { CouponsController } from './controllers/coupons.controller';
import { AffiliateController } from './controllers/affiliate.controller';
import { CoursesService } from './services/courses.service';
import { ModulesService } from './services/modules.service';
import { LessonsService } from './services/lessons.service';
import { BundlesService } from './services/bundles.service';
import { CouponsService } from './services/coupons.service';
import { AffiliateService } from './services/affiliate.service';
import { RevenueShareService } from './services/revenue-share.service';
import { LicenseKeyService } from './services/license-key.service';
import { GeoRestrictionService } from './services/geo-restriction.service';

@Module({
  controllers: [
    CoursesController,
    ModulesController,
    LessonsController,
    BundlesController,
    CouponsController,
    AffiliateController,
  ],
  providers: [
    CoursesService,
    ModulesService,
    LessonsService,
    BundlesService,
    CouponsService,
    AffiliateService,
    RevenueShareService,
    LicenseKeyService,
    GeoRestrictionService,
  ],
  exports: [
    CoursesService,
    ModulesService,
    LessonsService,
  ],
})
export class CoursesModule {}
