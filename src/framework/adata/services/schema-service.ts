import {IEntityCnf, IFieldCnf, ISchema} from "../ADataContext";

export interface IField {
  name: string;
  relation?: string;
  isMultiple?: boolean;
  isCount?: boolean;
}

export enum FieldType {
  Unknown,
  Title,
  Image,
  Gallery,
  String,
  Text,
  Integer,
  Currency,
  Categories,
  Tags,
  Type, // e.g. single tag
  Relation,
  Document,
}

export class SchemaService {

  schema: any;
  subSchemaHash: any = {};
  fieldCache: any = {};
  fieldHash: any = {}; // for findRelation by field
  fieldCnf: IFieldCnf;
  entityCnf: IEntityCnf;

  constructor(schema: ISchema) {
    this.fieldCnf = schema.fieldCnf
    this.entityCnf = schema.entityCnf
    this.schema = this.processAppDesign(schema.structure);
  }

  processAppDesign(schema: any) {

    // --- SubSchema Hash first
    for (const key of Object.keys(schema)) {
      if (schema[key].isNested === true) {
        this.subSchemaHash[key] = true;
      }
    }

    // --- all entity including subSchema
    const entities: any = {};
    for (const entityName of Object.keys(schema)) {
      if (entities[entityName]) {
        throw new Error(`duplicated, entity: ${entityName}`);
      }
      schema[entityName].name = entityName;
      entities[entityName] = this.processDesign(schema[entityName]);
    }
    return entities;
  }

  processName(fieldStr: string) {
    const result: any = {};
    if (fieldStr.includes('[]')) {
      result.isMultiple = true;
      fieldStr = fieldStr.replace('[]', '');
    }
    result.name = fieldStr;
    if (fieldStr.includes('@')) {
      const split = fieldStr.split('@');
      if (split.length !== 2) {
        throw new Error(`field includes @ but not length 2 on split, fieldStr: ${fieldStr}`);
      }
      // const name = split[0] === '' ? split[1] : split[0];
      result.name = split[0];
      const relation = split[1];
      result.relation = relation;
      if (this.fieldHash[result.name] && this.fieldHash[result.name] !== result.relation) {
        console.error('not the same!!', this.fieldHash[result.name], result.relation);
      }
      this.fieldHash[result.name] = result.relation;
      if (result.name.includes('categories')) {
        result.fieldType = FieldType.Categories;
      } else if ((Object.keys(this.subSchemaHash).includes(result.relation))) {
        result.fieldType = FieldType.Document;
        result.subSchema = relation;
      } else {
        result.fieldType = FieldType.Relation;
      }
    } else {
      if (result.name.includes('_count')) {
        result.isCount = true;
        result.fieldType = FieldType.Integer;
      } else if (['image'].includes(result.name)) {
        result.fieldType = FieldType.Image;
      } else if (['gallery'].includes(result.name)) {
        result.fieldType = FieldType.Gallery;
      } else if (['member_code'].includes(result.name)) {
        result.fieldType = FieldType.Integer;
      } else if (['title', 'display_name', 'full_name', 'nick_name'].includes(result.name)) {
        result.fieldType = FieldType.Title;
      } else if (['email'].includes(result.name)) {
        result.fieldType = FieldType.String;
      } else if (['total', 'subtotal', 'price', 'discount', 'discount_price'].includes(result.name)) {
        result.fieldType = FieldType.Currency;
      } else if (['shipping_address', 'billing_address', 'full_address'].includes(result.name)) {
        result.fieldType = FieldType.Text;
      } else {
        result.fieldType = FieldType.Unknown;
      }
    }
    return result;
  }

  processDesign(schema: any) {
    const fields: IField[] = [];
    const entityName = schema.name;
    if (!schema.fields) {
      console.error(`Schema ${entityName} has no .fields`);
    }
    for (const fieldStr of schema.fields) {

      // should only be string
      if (typeof fieldStr !== 'string') {
        throw new Error(`field must be string, entity: ${entityName}`);
      }
      const resultField: any = this.processName(fieldStr);
      fields.push(resultField);
    }
    return {
      name: entityName,
      isEntity: true,
      isNested: schema.isNested,
      isUniqueRelation: entityName.includes('_like') || entityName === 'followers',
      isMoreRelation: entityName.includes('_more'),
      fields,
      meta: schema.meta,
    };
  }

  findField(entityName: string, fieldName: string) {
    if (this.fieldCache[entityName]?.[fieldName]) {
      return this.fieldCache[entityName][fieldName];
    }
    let field = '';
    for (const _field of this.schema[entityName].fields) {
      if (_field.name === fieldName) {
        field = _field;
        break;
      }
    }
    // cache
    // ----------------------------------------
    if (!this.fieldCache[entityName]) {
      this.fieldCache[entityName] = {};
    }
    this.fieldCache[entityName][fieldName] = field;
    return field;
  }

  findRelation(fieldName: string) {
    return this.fieldHash[fieldName];
  }
}
