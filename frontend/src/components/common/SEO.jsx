import { useEffect } from 'react';

export default function SEO({ title, description, keywords }) {
  useEffect(() => {
    // 1. Update Title
    const baseTitle = 'ProjectFlow — Project Management';
    document.title = title ? `${title} | ProjectFlow` : baseTitle;

    // 2. Update Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // 3. Update Keywords
    if (keywords) {
      let metaKey = document.querySelector('meta[name="keywords"]');
      if (!metaKey) {
        metaKey = document.createElement('meta');
        metaKey.name = 'keywords';
        document.head.appendChild(metaKey);
      }
      metaKey.content = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    }

    // 4. Update Open Graph Tags
    const ogTags = {
      'og:title': title ? `${title} | ProjectFlow` : baseTitle,
      'og:description': description || 'A full-stack modern project management tool.',
      'og:type': 'website'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let metaOg = document.querySelector(`meta[property="${property}"]`);
      if (!metaOg) {
        metaOg = document.createElement('meta');
        metaOg.setAttribute('property', property);
        document.head.appendChild(metaOg);
      }
      metaOg.content = content;
    });
  }, [title, description, keywords]);

  return null;
}
