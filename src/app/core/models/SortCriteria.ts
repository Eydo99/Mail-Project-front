export interface SortCriteria {
  field: SortField;
  direction: SortDirection;
}

export type SortField = 'date' | 'sender' | 'subject' | 'importance';
export type SortDirection = 'asc' | 'desc';