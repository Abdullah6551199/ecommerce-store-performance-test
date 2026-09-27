import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface VideoPlayerProps {
  id?: string;
  sectionId?: string;
  variant?: "responsive" | "square" | string;
  settings?: {
    video_url?: string;
    poster_image?: string;
    autoplay?: boolean;
    loop?: boolean;
  };
}

export function VideoPlayer({
  id = "video_player",
  sectionId,
  variant = "responsive",
  settings = {},
}: VideoPlayerProps) {
  const videoUrl =
    settings.video_url ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const poster = settings.poster_image;
  const autoplay = settings.autoplay ?? false;
  const loop = settings.loop ?? false;

  const isSquare = variant === "square";

  return (
    <EditableComponent
      id={id}
      type="video_player"
      sectionId={sectionId}
      className={`rounded-2xl overflow-hidden bg-black shadow-lg my-3 ${
        isSquare ? "aspect-square max-w-md mx-auto" : "aspect-video w-full"
      }`}
    >
      <video
        src={videoUrl}
        poster={poster}
        controls
        playsInline
        autoPlay={autoplay}
        muted={autoplay}
        loop={loop}
        className="w-full h-full object-cover"
      />
    </EditableComponent>
  );
}

export default VideoPlayer;
