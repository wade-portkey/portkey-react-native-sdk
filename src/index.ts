import 'reflect-metadata';
import { initEntries } from './global/init/entries';
import { initJsMethodService } from './global/init/services';
import { initLanguage } from './i18n/index';

// we use i18n to translate
initLanguage();

// init portkey's entry page with its entry name
initEntries();

// init js services for Android/iOS native
initJsMethodService();

// export for npm
export * from './service/core';
