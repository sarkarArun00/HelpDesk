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
  language: HelpLanguage;
}

type HelpLanguage = 'English' | 'Hindi' | 'Bengali';

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
  selectedLanguage: HelpLanguage = 'Hindi';

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

  readonly languages: HelpLanguage[] = [
    'Hindi',
    'Bengali',
    'English',
  ];

  readonly videos: HelpVideo[] = [
    {
      id: 1,
      title: "Tutorial 01 - ISD - Ticket Login Overview(Bengali) | Nirnayan Healthcare",
      description:
        'Learn how to log in, navigate the dashboard, and use the main HelpDesk features.',
      category: 'Getting Started',
      youtubeVideoId: 'VgfqA5ILAc4',
      duration: '02:01',
      language: 'Bengali',
    }, // done
    {
      id: 2,
      title: 'Tutorial 01 - ISD - Ticket Login Overview(Hindi) | Nirnayan Healthcare',
      description:
        'Learn how to log in, navigate the dashboard, and use the main HelpDesk features.',
      category: 'Getting Started',
      youtubeVideoId: 'sp5PXzwLhkE',
      duration: '02:01',
      language: 'Hindi',
    }, // done
    {
      id: 3,
      title: "Tutorial 01 - ISD - Ticket Login Overview(English) | Nirnayan Healthcare",
      description:
        'Learn how to log in, navigate the dashboard, and use the main HelpDesk features.',
      category: 'Raise Ticket',
      youtubeVideoId: '3N7k9znkbMA',
      duration: '02:24',
      language: 'English',
    }, // done
    {
      id: 4,
      title: "Tutorial 02 - ISD - Raise Ticket(Hindi) | Nirnayan Healthcare",
      description:
        'Learn how to raise a new support ticket, select the appropriate category and priority, describe the issue, add an attachment, and submit it successfully.',
      category: 'Raise Ticket',
      youtubeVideoId: 'pprapkJqjjQ',
      duration: '02:21',
      language: 'Hindi',
    }, // done
    {
      id: 5,
      title: "Tutorial 02 - ISD - Raise Ticket(English) | Nirnayan Healthcare",
      description:
        'Learn how to raise a new support ticket, select the appropriate category and priority, describe the issue, add an attachment, and submit it successfully.',
      category: 'Ticket Management',
      youtubeVideoId: 'l8ll-L0Wp28',
      duration: '02:21',
      language: 'English',
    }, // done
    {
      id: 6,
      title: "Tutorial 02 - ISD - Raise Ticket(Bengali) | Nirnayan Healthcare",
      description:
        'Learn how to raise a new support ticket, select the appropriate category and priority, describe the issue, add an attachment, and submit it successfully.',
      category: 'Ticket Management',
      youtubeVideoId: 'yWs96k8vUIQ',
      duration: '02:21',
      language: 'Bengali',
    }, // done
    {
      id: 7,
      title: "Tutorial 03 - ISD - Ticket Reassign(Hindi) | Nirnayan Healthcare",
      description:
        'Learn how to reassign a support ticket to the appropriate team member and submit the changes successfully.',
      category: 'Ticket Management',
      youtubeVideoId: 'hzHx83SBIYY',
      duration: '01:00',
      language: 'Hindi',
    }, // done
    {
      id: 8,
      title: "Tutorial 03 - ISD - Ticket Reassign(Bengali) | Nirnayan Healthcare",
      description:
        'Learn how to reassign a support ticket to the appropriate team member and submit the changes successfully.',
      category: 'Ticket Management',
      youtubeVideoId: 'CyCqFGfnXv8',
      duration: '01:00',
      language: 'Bengali',
    }, // done
    {
      id: 9,
      title: "Tutorial 03 - ISD - Ticket Reassign(English) | Nirnayan Healthcare",
      description:
        'Learn how to reassign a support ticket to the appropriate team member and submit the changes successfully.',
      category: 'Ticket Management',
      youtubeVideoId: 'WfnuUeLz-UQ',
      duration: '01:00',
      language: 'English',
    }, // done
    {
      id: 10,
      title: "Tutorial 04 - ISD - Ticket Workflow(Hindi) | Nirnayan Healthcare",
      description:
        'Learn how to manage the complete ticket workflow, including reviewing, assigning, reassigning, updating, and resolving a ticket successfully.',
      category: 'Ticket Management',
      youtubeVideoId: 'GuHwoJBYp1k',
      duration: '01:42',
      language: 'Hindi',
    }, // done
    {
      id: 11,
      title: "Tutorial 04 - ISD - Ticket Workflow(English) | Nirnayan Healthcare",
      description:
        'Learn how to manage the complete ticket workflow, including reviewing, assigning, reassigning, updating, and resolving a ticket successfully.',
      category: 'Ticket Management',
      youtubeVideoId: 'VaFEOJ4UWOw',
      duration: '01:42',
      language: 'English',
    }, // done
    {
      id: 12,
      title: "Tutorial 04 - ISD - Ticket Workflow(Bengali) | Nirnayan Healthcare",
      description:
        'Learn how to manage the complete ticket workflow, including reviewing, assigning, reassigning, updating, and resolving a ticket successfully.',
      category: 'Ticket Management',
      youtubeVideoId: 'BoBXcM5fl6w',
      duration: '01:42',
      language: 'Bengali',
    }, // done

    {
      id: 16,
      title: "Tutorial 5 - ISD - Close Ticket Overview(English) | Nirnayan Healthcare",
      description:
        'Learn how to review a resolved ticket and close it after confirming that the issue has been successfully resolved.',
      category: 'Close Ticket',
      youtubeVideoId: 'nNpjTflBVeA',
      duration: '01:12',
      language: 'English',
    },
    {
      id: 17,
      title: "Tutorial 5 - ISD - Close Ticket Overview (Hindi) | Nirnayan Healthcare",
      description:
        'Learn how to review a resolved ticket and close it after confirming that the issue has been successfully resolved.',
      category: 'Close Ticket',
      youtubeVideoId: 'mFloiAzBobM',
      duration: '01:12',
      language: 'Hindi',
    },
    {
      id: 18,
      title: "Tutorial 5 - ISD - Close Ticket Overview(Bengali) Nirnayan Healthcare",
      description:
        'Learn how to review a resolved ticket and close it after confirming that the issue has been successfully resolved.',
      category: 'Close Ticket',
      youtubeVideoId: '3xvskmEoeCs',
      duration: '01:12',
      language: 'Bengali',
    }, //done
    {
      id: 13,
      title: "Tutorial 6 - ISD - Forget Password(Hindi) | Nirnayan Healthcare",
      description:
        'Learn how to reset a forgotten password and create a new one.',
      category: 'Forgot Password',
      youtubeVideoId: 'qwiUg2REhfk',
      duration: '01:44',
      language: 'Hindi',
    },
    {
      id: 14,
      title: "Tutorial 6 - ISD - Forget Password(Bengali) | Nirnayan Healthcare",
      description:
        'Learn how to reset a forgotten password and create a new one.',
      category: 'Forgot Password',
      youtubeVideoId: 'h0G_E0xjgeA',
      duration: '01:41',
      language: 'Bengali',
    },
    {
      id: 15,
      title: "Tutorial 6 - ISD - Forget Password(English) | Nirnayan Healthcare",
      description:
        'Learn how to reset a forgotten password and create a new one.',
      category: 'Forgot Password',
      youtubeVideoId: 'l6YHvIxVhF8',
      duration: '01:41',
      language: 'English',
    },
    {
      id: 19,
      title: "Tutorial 7 - ISD - Ticket Report(Bengali) | Nirnayan Healthcare",
      description:
        'Learn how to view, filter, and understand ticket reports for effective ticket tracking and management.',
      category: 'Ticket Report',
      youtubeVideoId: 'F3UHQHyTmuI',
      duration: '01:12',
      language: 'Bengali',
    },
    {
      id: 20,
      title: "Tutorial 7 - ISD - Ticket Report(English) | Nirnayan Healthcare",
      description:
        'Learn how to view, filter, and understand ticket reports for effective ticket tracking and management.',
      category: 'Ticket Report',
      youtubeVideoId: 'HAeZtzbw_QE',
      duration: '01:12',
      language: 'English',
    },
    {
      id: 21,
      title: "Tutorial 7 - ISD - Ticket Report(Hindi) | Nirnayan Healthcare",
      description:
        'Learn how to view, filter, and understand ticket reports for effective ticket tracking and management.',
      category: 'Ticket Report',
      youtubeVideoId: 'eh43jY1AgTQ',
      duration: '01:12',
      language: 'Hindi',
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

      const matchesLanguage =
        video.language === this.selectedLanguage;

      const matchesSearch =
        !searchValue ||
        video.title.toLowerCase().includes(searchValue) ||
        video.description.toLowerCase().includes(searchValue);

      return (
        matchesLanguage &&
        matchesCategory &&
        matchesSearch
      );
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  selectLanguage(language: HelpLanguage): void {
    this.selectedLanguage = language;
    this.selectedCategory = 'All';
    this.closeVideo();
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