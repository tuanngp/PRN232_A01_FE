import { Category, NewsArticle, NewsStatus, Tag } from '@/types/api';

// Mock categories
export const mockCategories: Category[] = [
  {
    categoryId: 1,
    categoryName: 'Technology',
    categoryDescription: 'Technology news and updates',
    isActive: true,
    createdDate: '2024-01-01T00:00:00Z'
  },
  {
    categoryId: 2,
    categoryName: 'Business',
    categoryDescription: 'Business and finance news',
    isActive: true,
    createdDate: '2024-01-01T00:00:00Z'
  },
  {
    categoryId: 3,
    categoryName: 'Community',
    categoryDescription: 'Community events and news',
    isActive: true,
    createdDate: '2024-01-01T00:00:00Z'
  },
  {
    categoryId: 4,
    categoryName: 'Sports',
    categoryDescription: 'Sports news and events',
    isActive: true,
    createdDate: '2024-01-01T00:00:00Z'
  },
  {
    categoryId: 5,
    categoryName: 'Arts & Culture',
    categoryDescription: 'Arts, culture and entertainment',
    isActive: true,
    createdDate: '2024-01-01T00:00:00Z'
  }
];

// Mock tags
export const mockTags: Tag[] = [
  { tagId: 1, tagName: 'Gadgets', createdDate: '2024-01-01T00:00:00Z' },
  { tagId: 2, tagName: 'Innovation', createdDate: '2024-01-01T00:00:00Z' },
  { tagId: 3, tagName: 'Startups', createdDate: '2024-01-01T00:00:00Z' },
  { tagId: 4, tagName: 'Funding', createdDate: '2024-01-01T00:00:00Z' },
  { tagId: 5, tagName: 'Events', createdDate: '2024-01-01T00:00:00Z' },
  { tagId: 6, tagName: 'Local', createdDate: '2024-01-01T00:00:00Z' },
  { tagId: 7, tagName: 'Championship', createdDate: '2024-01-01T00:00:00Z' },
  { tagId: 8, tagName: 'Victory', createdDate: '2024-01-01T00:00:00Z' },
  { tagId: 9, tagName: 'Festival', createdDate: '2024-01-01T00:00:00Z' },
  { tagId: 10, tagName: 'Talent', createdDate: '2024-01-01T00:00:00Z' }
];

// Mock articles
export const mockArticles: NewsArticle[] = [
  {
    newsArticleId: 1,
    newsTitle: 'Tech Giant Unveils New Gadget',
    headline: 'Revolutionary device promises to change how we interact with technology',
    newsContent: 'A major technology company has announced their latest innovation...',
    newsSource: 'TechNews',
    categoryId: 1,
    newsStatus: NewsStatus.Active,
    createdDate: '2024-01-15T10:00:00Z',
    modifiedDate: '2024-01-15T10:00:00Z',
    category: mockCategories[0],
    tags: [mockTags[0], mockTags[1]]
  },
  {
    newsArticleId: 2,
    newsTitle: 'Local Startup Secures Funding',
    headline: 'Young entrepreneurs receive significant investment for their innovative platform',
    newsContent: 'A promising local startup has successfully raised funds...',
    newsSource: 'Business Daily',
    categoryId: 2,
    newsStatus: NewsStatus.Active,
    createdDate: '2024-01-14T15:30:00Z',
    modifiedDate: '2024-01-14T15:30:00Z',
    category: mockCategories[1],
    tags: [mockTags[2], mockTags[3]]
  },
  {
    newsArticleId: 3,
    newsTitle: 'Community Event Draws Large Crowd',
    headline: 'Annual festival brings together thousands of residents',
    newsContent: 'The community came together for the annual festival...',
    newsSource: 'Community News',
    categoryId: 3,
    newsStatus: NewsStatus.Inactive,
    createdDate: '2024-01-13T09:00:00Z',
    modifiedDate: '2024-01-13T09:00:00Z',
    category: mockCategories[2],
    tags: [mockTags[4], mockTags[5]]
  },
  {
    newsArticleId: 4,
    newsTitle: 'Sports Team Wins Championship',
    headline: 'Local team brings home the trophy after intense season',
    newsContent: 'After months of training and competition...',
    newsSource: 'Sports Weekly',
    categoryId: 4,
    newsStatus: NewsStatus.Active,
    createdDate: '2024-01-12T18:00:00Z',
    modifiedDate: '2024-01-12T18:00:00Z',
    category: mockCategories[3],
    tags: [mockTags[6], mockTags[7]]
  },
  {
    newsArticleId: 5,
    newsTitle: 'Arts Festival Showcases Local Talent',
    headline: 'Creative community displays diverse artistic expressions',
    newsContent: 'The annual arts festival featured works from local artists...',
    newsSource: 'Arts Review',
    categoryId: 5,
    newsStatus: NewsStatus.Inactive,
    createdDate: '2024-01-11T14:00:00Z',
    modifiedDate: '2024-01-11T14:00:00Z',
    category: mockCategories[4],
    tags: [mockTags[8], mockTags[9]]
  }
]; 