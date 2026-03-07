export const UNMOUNT_MESSAGE = 'agentation:unmount'
export const PING_MESSAGE = 'agentation:ping'
export const BADGE_UPDATE_MESSAGE = 'agentation:badge-update'

export interface BadgeUpdateMessage {
  type: typeof BADGE_UPDATE_MESSAGE
  count: number
}

export interface UnmountMessage {
  type: typeof UNMOUNT_MESSAGE
}

export interface PingMessage {
  type: typeof PING_MESSAGE
}

export type ContentMessage = BadgeUpdateMessage | UnmountMessage | PingMessage
