import { Component } from '@angular/core';
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
export class CentreMaster {
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
    {
      id: 'CEN-001',
      centreCode: 'MLAB-A',
      centreName: 'Main Laboratory - Block A',
      centreType: 'Laboratory',
      region: 'Kolkata Central',
      city: 'Kolkata',
      state: 'West Bengal',
      pinCode: '700014',
      address: 'Central Kolkata, West Bengal',
      status: true,
      ticketCount: 46,
      createdAt: '2026-05-12T10:10:00',
      updatedAt: '2026-07-17T14:20:00',
    },
    {
      id: 'CEN-002',
      centreCode: 'SSC-01',
      centreName: 'South Satellite Centre',
      centreType: 'Collection Centre',
      region: 'Kolkata South',
      city: 'Kolkata',
      state: 'West Bengal',
      pinCode: '700047',
      address: 'South Kolkata, West Bengal',
      status: true,
      ticketCount: 27,
      createdAt: '2026-05-12T10:20:00',
      updatedAt: '2026-07-16T12:45:00',
    },
    {
      id: 'CEN-003',
      centreCode: 'CORP-HO',
      centreName: 'Corporate Office',
      centreType: 'Corporate Office',
      region: 'Kolkata Central',
      city: 'Kolkata',
      state: 'West Bengal',
      pinCode: '700091',
      address: 'Sector V, Salt Lake, Kolkata',
      status: true,
      ticketCount: 38,
      createdAt: '2026-05-12T10:30:00',
      updatedAt: '2026-07-15T17:25:00',
    },
    {
      id: 'CEN-004',
      centreCode: 'NTCC-01',
      centreName: 'New Town Collection Centre',
      centreType: 'Collection Centre',
      region: 'Kolkata East',
      city: 'New Town',
      state: 'West Bengal',
      pinCode: '700156',
      address: 'Action Area I, New Town',
      status: true,
      ticketCount: 19,
      createdAt: '2026-05-12T10:40:00',
      updatedAt: '2026-07-14T13:40:00',
    },
    {
      id: 'CEN-005',
      centreCode: 'NCC-01',
      centreName: 'North Collection Centre',
      centreType: 'Collection Centre',
      region: 'Kolkata North',
      city: 'Kolkata',
      state: 'West Bengal',
      pinCode: '700004',
      address: 'North Kolkata, West Bengal',
      status: true,
      ticketCount: 15,
      createdAt: '2026-05-13T09:30:00',
      updatedAt: '2026-07-13T11:15:00',
    },
    {
      id: 'CEN-006',
      centreCode: 'HOW-BR',
      centreName: 'Howrah Branch Office',
      centreType: 'Branch Office',
      region: 'Outside Kolkata',
      city: 'Howrah',
      state: 'West Bengal',
      pinCode: '711101',
      address: 'Howrah, West Bengal',
      status: false,
      ticketCount: 6,
      createdAt: '2026-05-13T09:40:00',
      updatedAt: '2026-07-10T16:35:00',
    },
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