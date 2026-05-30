import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "vừa xong"
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 604800)} tuần trước`
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} tháng trước`
  return `${Math.floor(diffInSeconds / 31536000)} năm trước`
}
