import type { ComponentSchema } from '../component-schema';
import { CORE_COMPONENT_SCHEMAS } from './core';
import { BASIC_COMPONENT_SCHEMAS } from './basic';
import { ECOMMERCE_COMPONENT_SCHEMAS } from './ecommerce';
import { FORM_COMPONENT_SCHEMAS } from './forms';
import { MEDIA_COMPONENT_SCHEMAS } from './media';

export * from './core';
export * from './basic';
export * from './ecommerce';
export * from './forms';
export * from './media';

export const ALL_COMPONENT_SCHEMAS: ComponentSchema[] = [
  ...CORE_COMPONENT_SCHEMAS,
  ...BASIC_COMPONENT_SCHEMAS,
  ...ECOMMERCE_COMPONENT_SCHEMAS,
  ...FORM_COMPONENT_SCHEMAS,
  ...MEDIA_COMPONENT_SCHEMAS,
];
