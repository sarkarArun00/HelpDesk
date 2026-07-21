import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { TicketCategoryApiService } from '../../services/ticket-category-api.service.js';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type CentreType =
  | 'Laboratory'
  | 'Collection Centre'
  | 'Corporate Office'
  | 'Branch Office';

interface CentreRecord {
  id: string;
  centreCode: string;
  centreName: string;
  centreType: CentreType;
  region: string;
  city: string;
  state: string;
  pinCode: string;
  address: string;
  status: boolean;
  ticketCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CentreFormModel {
  centreCode: string;
  centreName: string;
  centreType: CentreType | '';
  region: string;
  city: string;
  state: string;
  pinCode: string;
  address: string;
  status: boolean;
}

@Component({
  selector: 'app-centre-master',
  imports: [FormsModule, RouterLink],
  templateUrl: './centre-master.html',
  styleUrl: './centre-master.scss',
})
export class CentreMaster
  implements OnInit {
  private readonly TicketCategoryApiService =
    inject(TicketCategoryApiService);

  isLoading = false;

  loadError = '';
  searchTerm = '';

  selectedCentreType = '';

  selectedRegion = '';

  selectedStatus = '';

  isModalVisible = false;

  editingCentreId: string | null = null;

  successMessage = '';

  formError = '';

  readonly centreTypes: CentreType[] = [
    'Laboratory',
    'Collection Centre',
    'Corporate Office',
    'Branch Office',
  ];

  readonly regions = [
    'Kolkata Central',
    'Kolkata North',
    'Kolkata South',
    'Kolkata East',
    'Outside Kolkata',
  ];

  centres: CentreRecord[] = [
  ];

  centreForm: CentreFormModel = this.createEmptyForm();

  get filteredCentres(): CentreRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.centres.filter(centre => {
      const matchesSearch =
        !search ||
        centre.id.toLowerCase().includes(search) ||
        centre.centreCode.toLowerCase().includes(search) ||
        centre.centreName.toLowerCase().includes(search) ||
        centre.city.toLowerCase().includes(search) ||
        centre.pinCode.includes(search);

      const matchesType =
        !this.selectedCentreType ||
        centre.centreType === this.selectedCentreType;

      const matchesRegion =
        !this.selectedRegion ||
        centre.region === this.selectedRegion;

      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus === 'active' && centre.status) ||
        (this.selectedStatus === 'inactive' && !centre.status);

      return (
        matchesSearch &&
        matchesType &&
        matchesRegion &&
        matchesStatus
      );
    });
  }

  get activeCentreCount(): number {
    return this.centres.filter(centre => centre.status).length;
  }

  get inactiveCentreCount(): number {
    return this.centres.filter(centre => !centre.status).length;
  }

  get collectionCentreCount(): number {
    return this.centres.filter(
      centre => centre.centreType === 'Collection Centre',
    ).length;
  }

  get totalTicketCount(): number {
    return this.centres.reduce(
      (total, centre) => total + centre.ticketCount,
      0,
    );
  }

  get hasActiveFilters(): boolean {
    return Boolean(
      this.searchTerm ||
        this.selectedCentreType ||
        this.selectedRegion ||
        this.selectedStatus,
    );
  }

  ngOnInit(): void {
    this.loadCentres();
  }

  loadCentres(): void {
    this.isLoading = true;
    this.loadError = '';

    this.TicketCategoryApiService
      .getAllCentres()
      .subscribe({
        next: response => {
          this.isLoading = false;

          if (!response.success) {
            this.centres = [];

            this.loadError =
              response.message ||
              'Unable to load centres.';

            return;
          }

          this.centres =
            response.data
              .map(centre => ({
                id: String(centre.id),
                centreCode:
                  centre.centreCode,
                centreName:
                  centre.centreName.trim(),

                // These values are not provided
                // by the current list API.
                centreType:
                  'Branch Office' as CentreType,
                region: '',
                city: '',
                state: '',
                pinCode: '',
                address: '',
                status: true,
                ticketCount: 0,
                createdAt: '',
                updatedAt: '',
              }))
              .sort((first, second) =>
                first.centreName.localeCompare(
                  second.centreName,
                ),
              );
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          this.isLoading = false;
          this.centres = [];

          this.loadError =
            error.error?.message ||
            'Unable to load centres.';
        },
      });
  }
  
  openAddModal(): void {
    this.editingCentreId = null;
    this.centreForm = this.createEmptyForm();
    this.formError = '';
    this.isModalVisible = true;
  }

  openEditModal(centre: CentreRecord): void {
    this.editingCentreId = centre.id;

    this.centreForm = {
      centreCode: centre.centreCode,
      centreName: centre.centreName,
      centreType: centre.centreType,
      region: centre.region,
      city: centre.city,
      state: centre.state,
      pinCode: centre.pinCode,
      address: centre.address,
      status: centre.status,
    };

    this.formError = '';
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.editingCentreId = null;
    this.centreForm = this.createEmptyForm();
    this.formError = '';
  }

  saveCentre(): void {
    this.formError = '';
    this.successMessage = '';

    const centreCode = this.centreForm.centreCode
      .trim()
      .toUpperCase();

    const centreName = this.centreForm.centreName.trim();
    const city = this.centreForm.city.trim();
    const state = this.centreForm.state.trim();
    const pinCode = this.centreForm.pinCode.trim();
    const address = this.centreForm.address.trim();

    if (!centreCode) {
      this.formError = 'Centre code is required.';
      return;
    }

    if (!centreName) {
      this.formError = 'Centre name is required.';
      return;
    }

    if (!this.centreForm.centreType) {
      this.formError = 'Please select a centre type.';
      return;
    }

    if (!this.centreForm.region) {
      this.formError = 'Please select a region.';
      return;
    }

    if (!city) {
      this.formError = 'City is required.';
      return;
    }

    if (!state) {
      this.formError = 'State is required.';
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(pinCode)) {
      this.formError =
        'Enter a valid six-digit Indian PIN code.';
      return;
    }

    if (!address) {
      this.formError = 'Centre address is required.';
      return;
    }

    const duplicateCode = this.centres.some(
      centre =>
        centre.centreCode.toLowerCase() ===
          centreCode.toLowerCase() &&
        centre.id !== this.editingCentreId,
    );

    if (duplicateCode) {
      this.formError =
        'A centre with this code already exists.';
      return;
    }

    const duplicateName = this.centres.some(
      centre =>
        centre.centreName.toLowerCase() ===
          centreName.toLowerCase() &&
        centre.id !== this.editingCentreId,
    );

    if (duplicateName) {
      this.formError =
        'A centre with this name already exists.';
      return;
    }

    const currentDate = new Date().toISOString();

    if (this.editingCentreId) {
      this.centres = this.centres.map(centre => {
        if (centre.id !== this.editingCentreId) {
          return centre;
        }

        return {
          ...centre,
          centreCode,
          centreName,
          centreType:
            this.centreForm.centreType as CentreType,
          region: this.centreForm.region,
          city,
          state,
          pinCode,
          address,
          status: this.centreForm.status,
          updatedAt: currentDate,
        };
      });

      this.successMessage =
        `${centreName} has been updated successfully.`;
    } else {
      const newCentre: CentreRecord = {
        id: this.generateCentreId(),
        centreCode,
        centreName,
        centreType:
          this.centreForm.centreType as CentreType,
        region: this.centreForm.region,
        city,
        state,
        pinCode,
        address,
        status: this.centreForm.status,
        ticketCount: 0,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      this.centres = [newCentre, ...this.centres];

      this.successMessage =
        `${centreName} has been created successfully.`;
    }

    this.closeModal();
  }

  toggleCentreStatus(centre: CentreRecord): void {
    this.centres = this.centres.map(item => {
      if (item.id !== centre.id) {
        return item;
      }

      return {
        ...item,
        status: !item.status,
        updatedAt: new Date().toISOString(),
      };
    });

    this.successMessage = centre.status
      ? `${centre.centreName} has been deactivated.`
      : `${centre.centreName} has been activated.`;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCentreType = '';
    this.selectedRegion = '';
    this.selectedStatus = '';
  }

  getCentreTypeClass(centreType: CentreType): string {
    return `type-${centreType
      .toLowerCase()
      .replaceAll(' ', '-')}`;
  }

  getCentreTypeIcon(centreType: CentreType): string {
    const icons: Record<CentreType, string> = {
      Laboratory: 'bi-hospital',
      'Collection Centre': 'bi-geo-alt',
      'Corporate Office': 'bi-buildings',
      'Branch Office': 'bi-building',
    };

    return icons[centreType];
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  }

  private createEmptyForm(): CentreFormModel {
    return {
      centreCode: '',
      centreName: '',
      centreType: '',
      region: '',
      city: '',
      state: 'West Bengal',
      pinCode: '',
      address: '',
      status: true,
    };
  }

  private generateCentreId(): string {
    const highestId = this.centres.reduce(
      (maximumId, centre) => {
        const numericId = Number(
          centre.id.replace('CEN-', ''),
        );

        return Math.max(maximumId, numericId);
      },
      0,
    );

    return `CEN-${String(highestId + 1).padStart(
      3,
      '0',
    )}`;
  }
}