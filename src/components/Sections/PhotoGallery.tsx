import React from 'react';

interface PhotoGalleryProps {
  videos?: Array<{
    src: string;
    alt: string;
    startTime?: number;
  }>;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ videos }) => {
  const defaultVideos = [
    { src: '/assets/main/videos/film1.webm', alt: 'Event video 1', startTime: 7 },
    { src: '/assets/main/videos/film2.webm', alt: 'Event video 2', startTime: 3 },
    { src: '/assets/main/videos/film1.webm', alt: 'Event video 3', startTime: 2 },
    { src: '/assets/main/videos/film2.webm', alt: 'Event video 4', startTime: 4 },
  ];

  const videoData = videos || defaultVideos;

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement;
    const index = parseInt(target.getAttribute('data-index') || '1');
    target.outerHTML = `<img src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDI4MCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzIwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkV2ZW50IFZpZGVvICR7aW5kZXh9PC90ZXh0Pjwvc3ZnPg==' alt='Event Video ${index}'/>`;
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement;
    const startTime = parseFloat(target.getAttribute('data-start-time') || '0');
    if (startTime > 0) {
      target.currentTime = startTime;
    }
  };

  const handleVideoEnd = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement;
    const startTime = parseFloat(target.getAttribute('data-start-time') || '0');
    target.currentTime = startTime;
    target.play();
  };

  return (
    <main className="main-content">
      <div className="photo-gallery">
        {videoData.map((video, index) => (
          <div key={index} className="photo-frame">
            <video
              src={video.src}
              alt={video.alt}
              autoPlay
              muted
              loop
              playsInline
              data-start-time={video.startTime?.toString() || '0'}
              data-index={(index + 1).toString()}
              onError={handleVideoError}
              onLoadedMetadata={handleVideoLoad}
              onEnded={handleVideoEnd}
            />
          </div>
        ))}
      </div>
    </main>
  );
};

export default PhotoGallery;