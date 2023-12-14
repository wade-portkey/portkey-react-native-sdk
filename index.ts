import 'reflect-metadata';
import { initEntries } from './src/global/init/entries';
import { initJsMethodService } from './src/global/init/services';
import { initLanguage } from './src/i18n/index';

// we use i18n to translate
initLanguage();

// init portkey's entry page with its entry name
initEntries();

// init js services for Android/iOS native
initJsMethodService();

// export for npm
export * from './src/service/core';
