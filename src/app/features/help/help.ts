import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';

interface HelpVideo {
  id: number;
  title: string;
  description: string;
  category: string;
  youtubeVideoId: string;
  duration: string;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
  searchTerm = '';
  selectedCategory = 'All';

  selectedVideo: HelpVideo | null = null;
  selectedVideoUrl: SafeResourceUrl | null = null;

  readonly categories: string[] = [
    'All',
    'Raise Ticket',
    'Getting Started',
    'Ticket Management',
    'Reports',
    'Administration',
  ];

  readonly videos: HelpVideo[] = [
    {
      id: 1,
      title: 'Getting Started with HelpDesk (Hindi)',
      description:
        'Learn how to log in, navigate the dashboard, and use the main HelpDesk features.',
      category: 'Getting Started',
      youtubeVideoId: 'hwGxGYXAw6Q',
      duration: '02:20',
    },
    {
      id: 2,
      title: 'Getting Started with HelpDesk (Bengali)',
      description:
        'Learn how to log in, navigate the dashboard, and use the main HelpDesk features.',
      category: 'Getting Started',
      youtubeVideoId: 'u0-SCYnO--g',
      duration: '02:20',
    },
    {
      id: 3,
      title: 'ISD - Ticket Management System (Hindi)',
      description:
        'How to raise ticket.',
      category: 'Raise Ticket',
      youtubeVideoId: 'Bo-q6ty6lfI',
      duration: '02:24',
    },
    {
      id: 4,
      title: 'ISD - Ticket Management System (Bengali)',
      description:
        'How to raise ticket.',
      category: 'Raise Ticket',
      youtubeVideoId: 'K_YuRzyUNxA',
      duration: '02:17',
    },
    {
      id: 5,
      title: 'Assign and Manage Tickets (Hindi)',
      description:
        'Learn how to assign, update, track, and resolve support tickets.',
      category: 'Ticket Management',
      youtubeVideoId: 'yDlAzuKyzEI',
      duration: '01:43',
    },
    {
      id: 6,
      title: 'Assign and Manage Tickets (Bengali)',
      description:
        'Learn how to assign, update, track, and resolve support tickets.',
      category: 'Ticket Management',
      youtubeVideoId: 'bcooRZ8WFVo',
      duration: '01:43',
    },
  ];

  constructor(
    private readonly sanitizer: DomSanitizer,
  ) { }

  get filteredVideos(): HelpVideo[] {
    const searchValue =
      this.searchTerm.trim().toLowerCase();

    return this.videos.filter(video => {
      const matchesCategory =
        this.selectedCategory === 'All' ||
        video.category === this.selectedCategory;

      const matchesSearch =
        !searchValue ||
        video.title.toLowerCase().includes(searchValue) ||
        video.description.toLowerCase().includes(searchValue);

      return matchesCategory && matchesSearch;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  openVideo(video: HelpVideo): void {
    this.selectedVideo = video;

    this.selectedVideoUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=1`,
      );
  }

  closeVideo(): void {
    this.selectedVideo = null;
    this.selectedVideoUrl = null;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  getThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
}