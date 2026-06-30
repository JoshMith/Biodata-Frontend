import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuditLog, AuditLogFilters } from '../utils/auditLogs.interface';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent implements OnInit {

  logs = signal<AuditLog[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  readonly pageSize = 20;

  filterForm: FormGroup;

  readonly entityOptions = [
    'user', 'user_role', 'baptism', 'confirmation',
    'eucharist', 'marriages', 'contribution', 'scc', 'family',
  ];
  readonly actionOptions = ['CREATE', 'UPDATE', 'DELETE'];

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      entity: [''],
      action: [''],
      actorEmail: [''],
      from: [''],
      to: [''],
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const filters: AuditLogFilters = {
      page,
      limit: this.pageSize,
      ...this.filterForm.value,
    };

    this.api.getAuditLogs(filters).subscribe({
      next: res => {
        this.logs.set(res.data);
        this.currentPage.set(res.pagination.page);
        this.totalPages.set(res.pagination.pages);
        this.totalItems.set(res.pagination.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load audit logs. Please try again.');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void { this.load(1); }

  resetFilters(): void {
    this.filterForm.reset({ entity: '', action: '', actorEmail: '', from: '', to: '' });
    this.load(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.load(page);
  }

  /** Triggers browser file-save using existing downloadAuditLogs in ApiService */
  exportCsv(): void {
    const { entity, action, actorEmail, from, to } = this.filterForm.value;
    this.api.downloadAuditLogs({ entity, action, actor_id: undefined, from, to })
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
      });
  }

  // ── Display helpers ─────────────────────────────────────────────────────

  actionClass(action: string): string {
    const map: Record<string, string> = {
      CREATE: 'badge--create',
      UPDATE: 'badge--update',
      DELETE: 'badge--delete',
    };
    return map[action] ?? '';
  }

  parseDetail(detail: string | null): string {
    if (!detail) return '—';
    try {
      const obj = JSON.parse(detail);
      return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(' · ');
    } catch {
      return detail;
    }
  }

  visiblePages(): number[] {
    const total = this.totalPages();
    const cur = this.currentPage();
    const range: number[] = [];
    for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) {
      range.push(i);
    }
    return range;
  }
}