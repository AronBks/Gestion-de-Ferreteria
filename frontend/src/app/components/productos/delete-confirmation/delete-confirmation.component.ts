import { Component, EventEmitter, Input, Output, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() titulo: string = '⚠️ Confirmar Eliminación';
  @Input() mensaje: string = '¿Estás seguro de que deseas continuar?';
  @Input() productoId: string | null = null;
  @Input() productoNombre: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  loading = false;
  errorMessage = '';

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { }

  ngOnChanges(changes: any): void {
    if (changes['isVisible'] || changes['productoId'] || changes['productoNombre']) {
      if (this.cdr?.markForCheck) this.cdr.markForCheck();
    }
  }

  onConfirm(): void {
    this.loading = false;
    this.confirm.emit();
    this.confirmed.emit();
    this.closeModal();
  }

  closeModal(): void {
    this.errorMessage = '';
    this.close.emit();
    this.cancel.emit();
  }
}
