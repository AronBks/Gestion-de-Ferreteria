import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-factura-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './factura-modal.component.html',
  styleUrls: ['./factura-modal.component.scss']
})
export class FacturaModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() facturaData: any = null;
  @Output() close = new EventEmitter<void>();

  ferreteriaData = {
    nombre: 'FERRETERÍA POS',
    direccion: 'Av. Industrial 123, Zona Centro',
    telefono: '+591 76543210',
    nit: '1234567890'
  };

  ngOnInit(): void {}

  onClose(): void {
    this.isOpen = false;
    this.close.emit();
  }

  printFactura(): void {
    window.print();
  }
}
