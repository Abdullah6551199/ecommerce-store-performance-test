import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface AudioPlayerProps {
  id?: string;
  sectionId?: string;
  settings?: {
    audio_url?: string;
    title?: string;
    artist?: string;
  };
}

export function AudioPlayer({
  id = "audio_player",
  sectionId,
  settings = {},
}: AudioPlayerProps) {
  const audioUrl =
    settings.audio_url ||
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const title = settings.title || "Brand Anthem Vol. 1";
  const artist = settings.artist || "Nasrify Studios";

  return (
    <EditableComponent
      id={id}
      type="audio_player"
      sectionId={sectionId}
      className="p-4 rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] shadow-xs my-3 space-y-2.5"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎵</span>
        <div>
          <h5 className="font-bold text-xs sm:text-sm text-[var(--theme-text,#18181B)]">{title}</h5>
          <p className="text-[11px] text-[var(--theme-text-muted,#71717A)]">{artist}</p>
        </div>
      </div>
      <audio src={audioUrl} controls className="w-full h-8" />
    </EditableComponent>
  );
}

export default AudioPlayer;
