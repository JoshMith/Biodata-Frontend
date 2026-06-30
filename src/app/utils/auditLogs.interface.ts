export interface AuditLog {
  id:          number;
  created_at:  string;
  actor_id:    string;
  actor_email: string;
  actor_role:  string;
  action:      'CREATE' | 'UPDATE' | 'DELETE';
  entity:      string;
  entity_id:   string | null;
  detail:      string | null;
  ip_address:  string | null;
}
 
export interface AuditLogPage {
  data: AuditLog[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
 
export interface AuditLogFilters {
  page?:       number;
  limit?:      number;
  entity?:     string;
  action?:     string;
  actorEmail?: string;
  actor_id?:   string;
  from?:       string;
  to?:         string;
}