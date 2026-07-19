"use client";

import * as React from "react";

import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
} from "./ui/emoji-picker";

export function EmojiPickerDemo() {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <EmojiPicker
        className="h-[326px] rounded-lg border border-gray-200 shadow-md bg-white"
        onEmojiSelect={(emoji: any) => {
          console.log(emoji);
        }}
      >
        <EmojiPickerSearch />
        <EmojiPickerContent />
      </EmojiPicker>
    </div>
  );
}
