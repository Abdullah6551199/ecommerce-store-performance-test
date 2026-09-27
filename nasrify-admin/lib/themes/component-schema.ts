/**
 * Component Schema System (Stage 47)
 * Defines declarative schemas for micro-components inside sections
 */

import { FieldConfig, FieldOption, SectionVariant } from './section-schema';

export type ComponentCategory = 'basic' | 'ecommerce' | 'form' | 'media' | 'content';

export interface ComponentVariant {
  value: string;
  label: string;
}

export interface ComponentPreset {
  name: string;
  settings: Record<string, any>;
  style?: Record<string, any>;
  advanced?: Record<string, any>;
}

export interface ComponentSchema {
  type: string;
  label: string;
  category: ComponentCategory;
  description?: string;
  icon?: string;
  variants?: ComponentVariant[];
  presets?: ComponentPreset[];
  content: FieldConfig[];
  defaults: Record<string, any>;
  defaultStyle?: Record<string, any>;
  defaultAdvanced?: Record<string, any>;
}

export const COMPONENT_SCHEMAS: Record<string, ComponentSchema> = {};

let schemasInitialized = false;

function ensureSchemasInitialized(): void {
  if (schemasInitialized) return;
  schemasInitialized = true;
  if (typeof ALL_COMPONENT_SCHEMAS !== "undefined" && Array.isArray(ALL_COMPONENT_SCHEMAS)) {
    for (const s of ALL_COMPONENT_SCHEMAS) {
      if (s && s.type) {
        COMPONENT_SCHEMAS[s.type] = s;
      }
    }
  }
}

export function getComponentSchema(type: string): ComponentSchema | undefined {
  ensureSchemasInitialized();
  return COMPONENT_SCHEMAS[type];
}

export function registerComponentSchema(schema: ComponentSchema): void {
  if (schema && schema.type) {
    COMPONENT_SCHEMAS[schema.type] = schema;
  }
}

export function registerComponentSchemas(schemas: ComponentSchema[]): void {
  if (Array.isArray(schemas)) {
    schemas.forEach((s) => {
      if (s && s.type) {
        COMPONENT_SCHEMAS[s.type] = s;
      }
    });
  }
}

// Auto-register components
import { ALL_COMPONENT_SCHEMAS } from './components';
ensureSchemasInitialized();

