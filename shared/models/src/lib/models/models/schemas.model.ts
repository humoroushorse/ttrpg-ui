export interface BookkeepingSchemaCreate {
  created_at: Date | string;
  created_by: string;
}

export interface BookkeepingSchemaUpdate {
  updated_at: Date | string;
  updated_by: string;
}

export type BookkeepingSchema = BookkeepingSchemaCreate & BookkeepingSchemaUpdate;
