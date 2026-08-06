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
    // 'Reports',
    // 'Administration',
  ];

  readonly videos: HelpVideo[] = [
    {
      id: 1,
      title: "Tutorial 01 - ISD - Ticket Login Overview(Hindi) | Nirnayan Healthcare",
      description:
        'Learn how to log in, navigate the dashboard, and use the main HelpDesk features.',
      category: 'Getting Started',
      youtubeVideoId: 'RHeD1RQh9Ek',
      duration: '02:01',
    },
    {
      id: 2,
      title: 'Tutorial 02 - ISD - Ticket Login Overview (Bengali)|Nirnayan Healthcare',
      description:
        'Learn how to log in, navigate the dashboard, and use the main HelpDesk features.',
      category: 'Getting Started',
      youtubeVideoId: 'eAyXDNNFs_0',
      duration: '02:01',
    },
    {
      id: 3,
      title: "Tutorial 03 - ISD - Raise Ticket(Hindi) | Nirnayan Healthcare",
      description:
        'How to raise ticket.',
      category: 'Raise Ticket',
      youtubeVideoId: 'Y_2EyZsig1I',
      duration: '02:24',
    },
    {
      id: 4,
      title: "Tutorial 04 - ISD - Raise Ticket(Bengali) | Nirnayan Healthcare",
      description:
        'How to raise ticket.',
      category: 'Raise Ticket',
      youtubeVideoId: 'o5-D5c8zzUk',
      duration: '02:24',
    },
    {
      id: 5,
      title: "Tutorial 05 - ISD - Ticket Workflow(Bengali) | Nirnayan Healthcare",
      description:
        'Learn how to assign, update, track, and resolve support tickets.',
      category: 'Ticket Management',
      youtubeVideoId: 'vCWaIWB5cpM',
      duration: '01:43',
    },
    {
      id: 6,
      title: "Tutorial 06 - ISD - Ticket Workflow (Hindi) | Nirnayan Healthcare",
      description:
        'Learn how to assign, update, track, and resolve support tickets.',
      category: 'Ticket Management',
      youtubeVideoId: '_QHcN-pG4MY',
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