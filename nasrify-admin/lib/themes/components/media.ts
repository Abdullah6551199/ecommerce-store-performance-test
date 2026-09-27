import { ComponentSchema } from '../component-schema';

export const MEDIA_COMPONENT_SCHEMAS: ComponentSchema[] = [
  {
    type: 'video_player',
    label: 'Video Player',
    category: 'media',
    description: 'Embedded YouTube, Vimeo, or HTML5 video player',
    icon: '🎬',
    variants: [
      { value: 'responsive', label: '16:9 Responsive' },
      { value: 'square', label: '1:1 Square' },
    ],
    content: [
      { key: 'video_url', type: 'url', label: 'Video URL (MP4, YouTube, Vimeo)', default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { key: 'poster_image', type: 'image', label: 'Poster / Thumbnail Image', default: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop' },
      { key: 'autoplay', type: 'boolean', label: 'Autoplay (Muted)', default: false },
      { key: 'loop', type: 'boolean', label: 'Loop Video', default: false },
    ],
    defaults: {
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster_image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
      autoplay: false,
      loop: false,
    },
  },
  {
    type: 'audio_player',
    label: 'Audio Player',
    category: 'media',
    description: 'Soundtrack or podcast player with custom controls',
    icon: '🎵',
    content: [
      { key: 'audio_url', type: 'url', label: 'Audio Stream / MP3 URL', default: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { key: 'title', type: 'text', label: 'Track Title', default: 'Brand Anthem Vol. 1' },
      { key: 'artist', type: 'text', label: 'Artist / Author', default: 'Nasrify Studios' },
    ],
    defaults: {
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      title: 'Brand Anthem Vol. 1',
      artist: 'Nasrify Studios',
    },
  },
  {
    type: 'gallery_grid',
    label: 'Image Gallery Grid',
    category: 'media',
    description: 'Multi-image lookbook grid with thumbnail view',
    icon: '🖼️',
    content: [
      {
        key: 'images',
        type: 'repeater',
        label: 'Gallery Photos',
        default: [
          { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop', caption: 'Athletic Collection' },
          { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', caption: 'Footwear Series' },
          { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', caption: 'Accessories' },
        ],
        fields: [
          { key: 'url', type: 'image', label: 'Photo URL', default: '' },
          { key: 'caption', type: 'text', label: 'Caption', default: '' },
        ],
      },
      { key: 'columns', type: 'number', label: 'Grid Columns', default: 3, min: 1, max: 5 },
    ],
    defaults: {
      images: [
        { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop', caption: 'Athletic Collection' },
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', caption: 'Footwear Series' },
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', caption: 'Accessories' },
      ],
      columns: 3,
    },
  },
  {
    type: 'slideshow',
    label: 'Slideshow / Carousel',
    category: 'media',
    description: 'Rotating photo carousel with autoplay controls',
    icon: '🎞️',
    content: [
      {
        key: 'slides',
        type: 'repeater',
        label: 'Slides',
        default: [
          { image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop', heading: 'Modern Streetwear' },
          { image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', heading: 'Peak Performance' },
        ],
        fields: [
          { key: 'image_url', type: 'image', label: 'Slide Image', default: '' },
          { key: 'heading', type: 'text', label: 'Slide Caption', default: '' },
        ],
      },
      { key: 'autoplay', type: 'boolean', label: 'Autoplay Rotation', default: true },
    ],
    defaults: {
      slides: [
        { image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop', heading: 'Modern Streetwear' },
        { image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', heading: 'Peak Performance' },
      ],
      autoplay: true,
    },
  },
  {
    type: 'lightbox_image',
    label: 'Lightbox Image',
    category: 'media',
    description: 'Image with click-to-enlarge high-resolution modal zoom',
    icon: '🔍',
    content: [
      { key: 'image_url', type: 'image', label: 'Image URL', default: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop' },
      { key: 'alt', type: 'text', label: 'Alt Text', default: 'Zoomable product showcase' },
      { key: 'caption', type: 'text', label: 'Overlay Caption', default: 'Click to expand high-res photography' },
    ],
    defaults: {
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
      alt: 'Zoomable product showcase',
      caption: 'Click to expand high-res photography',
    },
  },
];
