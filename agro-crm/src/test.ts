// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Import all test files explicitly
import '../tests/app/app.component.spec';
import '../tests/app/core/services/dashboard.service.spec';
import '../tests/app/core/services/leads.service.spec';
import '../tests/app/core/services/properties.service.spec';
import '../tests/app/features/dashboard/dashboard.component.spec';
import '../tests/app/shared/utils/validators.spec';

