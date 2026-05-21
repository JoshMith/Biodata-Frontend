import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
  forwardRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-parish-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './parish-autocomplete.component.html',
  styleUrl: './parish-autocomplete.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ParishAutocompleteComponent),
      multi: true,
    },
  ],
})
export class ParishAutocompleteComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() placeholder = 'Type a parish name...';
  @Input() label = 'Place / Parish';
  @Input() required = false;
  @Input() externalControl: AbstractControl | null = null;

  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLUListElement>;

  inputControl = new FormControl('');

  allParishes: string[] = [];
  filteredSuggestions: string[] = [];
  showDropdown = false;
  activeIndex = -1;
  isLoading = false;

  private destroy$ = new Subject<void>();
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadParishes();

    this.inputControl.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((val) => {
        const value = val ?? '';
        this.onChange(value);
        this.valueChange.emit(value);
        this.filterSuggestions(value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadParishes(): void {
    this.isLoading = true;
    this.apiService.getParishes().subscribe({
      next: (data: any[]) => {
        const names = new Set<string>();
        data.forEach((p) => {
          if (p.parish_name) names.add(p.parish_name.trim());
        });
        this.allParishes = Array.from(names).sort();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private filterSuggestions(query: string): void {
    if (!query || query.trim().length < 1) {
      this.filteredSuggestions = [];
      this.showDropdown = false;
      return;
    }

    const lower = query.toLowerCase();
    this.filteredSuggestions = this.allParishes
      .filter((p) => p.toLowerCase().includes(lower))
      .slice(0, 8);

    this.showDropdown = this.filteredSuggestions.length > 0;
    this.activeIndex = -1;
  }

  selectSuggestion(suggestion: string): void {
    this.inputControl.setValue(suggestion, { emitEvent: false });
    this.onChange(suggestion);
    this.valueChange.emit(suggestion);
    this.showDropdown = false;
    this.filteredSuggestions = [];
    this.activeIndex = -1;
    this.onTouched();
  }

  onInputFocus(): void {
    const val = this.inputControl.value ?? '';
    if (val.trim().length >= 1) {
      this.filterSuggestions(val);
    }
  }

  onInputBlur(): void {
    // Delay to allow click on suggestion to register
    setTimeout(() => {
      this.showDropdown = false;
      this.onTouched();
    }, 200);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(
          this.activeIndex + 1,
          this.filteredSuggestions.length - 1
        );
        this.scrollToActive();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        this.scrollToActive();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectSuggestion(this.filteredSuggestions[this.activeIndex]);
        }
        break;
      case 'Escape':
        this.showDropdown = false;
        this.activeIndex = -1;
        break;
    }
  }

  private scrollToActive(): void {
    if (!this.dropdownRef) return;
    const listEl = this.dropdownRef.nativeElement;
    const activeEl = listEl.children[this.activeIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  highlightMatch(text: string): string {
    const query = this.inputControl.value ?? '';
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(
      new RegExp(`(${escaped})`, 'gi'),
      '<mark>$1</mark>'
    );
  }

  get isInvalid(): boolean {
    if (this.externalControl) {
      return !!(
        this.externalControl.invalid &&
        (this.externalControl.touched)
      );
    }
    return !!(
      this.inputControl.invalid &&
      (this.inputControl.touched)
    );
  }

  get isValid(): boolean {
    if (this.externalControl) {
      return !!(
        this.externalControl.valid &&
        (this.externalControl.dirty)
      );
    }
    return !!(
      this.inputControl.valid &&
      (this.inputControl.dirty)
    );
  }

  // ControlValueAccessor
  writeValue(value: string): void {
    this.inputControl.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.inputControl.disable() : this.inputControl.enable();
  }
}