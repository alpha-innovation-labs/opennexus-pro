export type ConversationMutationAction = "steer" | "stop";

export interface ConversationMutationRoute {
  conversationId: string;
  action: ConversationMutationAction;
}

/**
 * Parses annotation conversation mutation routes.
 *
 * @param pathname Request pathname.
 * @returns Parsed route, or null when the path is not a conversation mutation.
 */
export function routeConversationMutation(pathname: string): ConversationMutationRoute | null {
  const match = pathname.match(/^\/annotation-conversations\/([^/]+)\/(steer|stop)$/u);
  if (!match) return null;
  return { conversationId: decodeURIComponent(match[1]), action: match[2] as ConversationMutationAction };
}
