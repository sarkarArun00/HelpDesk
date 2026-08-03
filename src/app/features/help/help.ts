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
    'Getting Started',
    'Raise Ticket',
    'Ticket Management',
    'Reports',
    'Administration',
  ];

  readonly videos: HelpVideo[] = [
    {
      id: 1,
      title: 'Getting Started with HelpDesk',
      description:
        'Learn how to log in, navigate the dashboard, and use the main HelpDesk features.',
      category: 'Getting Started',
      youtubeVideoId: 'sF6fxhX1Mo0',
      duration: '6:24',
    },
    {
      id: 2,
      title: 'How to Raise a Ticket',
      description:
        'A complete guide to selecting a category, entering ticket details, and adding attachments.',
      category: 'Raise Ticket',
      youtubeVideoId: 'YOUR_VIDEO_ID',
      duration: '04:45',
    },
    {
      id: 3,
      title: 'Assign and Manage Tickets',
      description:
        'Learn how to assign, update, track, and resolve support tickets.',
      category: 'Ticket Management',
      youtubeVideoId: 'YOUR_VIDEO_ID',
      duration: '07:10',
    },
    {
      id: 4,
      title: 'Ticket Reports and Filters',
      description:
        'Understand ticket reports, search filters, charts, pagination, and exports.',
      category: 'Reports',
      youtubeVideoId: 'YOUR_VIDEO_ID',
      duration: '06:20',
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