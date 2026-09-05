import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Forward, Pencil, Reply, SmilePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { chatService } from "@/services/chatService";
import { useChatStore } from "@/stores/useChatStore";

const REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "😡"];

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const [reactionMenuOpen, setReactionMenuOpen] = useState(false);
  const [reactionLoading, setReactionLoading] = useState(false);
  const updateMessageReactions = useChatStore(
    (state) => state.updateMessageReactions
  );
  const setReplyTo = useChatStore((state) => state.setReplyTo);
  const setEditingMessage = useChatStore((state) => state.setEditingMessage);
  const removeMessage = useChatStore((state) => state.removeMessage);
  const conversations = useChatStore((state) => state.conversations);
  const [forwardMenuOpen, setForwardMenuOpen] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const prev = index + 1 < messages.length ? messages[index + 1] : undefined;

  const isShowTime =
    index === 0 ||
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      300000; // 5 phút

  const isGroupBreak = isShowTime || message.senderId !== prev?.senderId;

  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString()
  );

  return (
    <>
      {/* time */}
      {isShowTime && (
        <span className="flex justify-center text-xs text-muted-foreground px-1">
          {formatMessageTime(new Date(message.createdAt))}
        </span>
      )}

      <div
        className={cn(
          "flex gap-2 message-bounce mt-1",
          message.isOwn ? "justify-end" : "justify-start"
        )}
      >
        {/* avatar */}
        {!message.isOwn && (
          <div className="w-8">
            {isGroupBreak && (
              <UserAvatar
                type="chat"
                name={participant?.displayName ?? "ChatsApp"}
                avatarUrl={participant?.avatarUrl ?? undefined}
              />
            )}
          </div>
        )}

        {/* tin nhắn */}
        <div
          className={cn(
            "max-w-xs lg:max-w-md space-y-1 flex flex-col",
            message.isOwn ? "items-end" : "items-start"
          )}
        >
          <div className="relative group">
            <Card
              className={cn(
                "p-3",
                message.isOwn ? "chat-bubble-sent border-0" : "chat-bubble-received"
              )}
            >
            {message.imgUrl && (
              <img
                src={message.imgUrl}
                alt="Shared attachment"
                className="max-h-80 max-w-full rounded-md object-cover"
              />
            )}
            {message.content && (
              <p className="text-sm leading-relaxed break-words">{message.content}</p>
            )}
            </Card>

            <div
              className={cn(
                "absolute -top-10 flex items-center gap-1 rounded-full border bg-background p-1 shadow-md transition-opacity",
                message.isOwn ? "right-0" : "left-0",
                reactionMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
              )}
            >
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  title={`React ${emoji}`}
                  className="size-7 rounded-full text-sm hover:bg-primary/10"
                  disabled={reactionLoading}
                  onClick={async () => {
                    setReactionLoading(true);
                    try {
                      const reactions = await chatService.toggleMessageReaction(
                        message._id,
                        emoji
                      );
                      updateMessageReactions(message._id, reactions);
                      setReactionMenuOpen(false);
                    } finally {
                      setReactionLoading(false);
                    }
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Add reaction"
              className="absolute -right-9 top-1/2 size-7 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setReactionMenuOpen((open) => !open)}
            >
              <SmilePlus className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Forward message"
              className="absolute -right-32 top-1/2 size-7 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setForwardMenuOpen((open) => !open)}
            >
              <Forward className="size-4" />
            </Button>

            {forwardMenuOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 max-h-48 w-52 overflow-y-auto rounded-md border bg-background p-1 shadow-lg">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Forward to...</p>
                {conversations
                  .filter((conversation) => conversation._id !== selectedConvo._id)
                  .map((conversation) => (
                    <button
                      key={conversation._id}
                      type="button"
                      className="block w-full truncate rounded px-2 py-2 text-left text-xs hover:bg-muted"
                      disabled={forwarding}
                      onClick={async () => {
                        setForwarding(true);
                        try {
                          await chatService.forwardMessage(message._id, conversation._id);
                          setForwardMenuOpen(false);
                        } finally {
                          setForwarding(false);
                        }
                      }}
                    >
                      {conversation.type === "group"
                        ? conversation.group?.name
                        : conversation.participants.map((participant) => participant.displayName).join(", ")}
                    </button>
                  ))}
              </div>
            )}

            {message.isOwn && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Edit message"
                  className="absolute -left-16 top-1/2 size-7 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setEditingMessage(message)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete message"
                  className="absolute -left-24 top-1/2 size-7 -translate-y-1/2 opacity-0 text-destructive transition-opacity group-hover:opacity-100"
                  onClick={async () => {
                    if (!window.confirm("Xóa tin nhắn này?")) return;
                    await chatService.deleteMessage(message._id);
                    removeMessage(message._id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Reply to message"
              className="absolute -right-16 top-1/2 size-7 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setReplyTo(message)}
            >
              <Reply className="size-4" />
            </Button>

            {message.replyTo && (
              <div className="mb-1 max-w-full rounded border-l-2 border-primary/60 bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
                {message.replyTo.content || "Ảnh đính kèm"}
              </div>
            )}

            {!!message.reactions?.length && (
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(
                  message.reactions.reduce<Record<string, number>>((counts, reaction) => {
                    counts[reaction.emoji] = (counts[reaction.emoji] ?? 0) + 1;
                    return counts;
                  }, {})
                ).map(([emoji, count]) => (
                  <span key={emoji} className="rounded-full border bg-background px-1.5 py-0.5 text-xs shadow-sm">
                    {emoji} {count > 1 ? count : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* seen/ delivered */}
          {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1.5 py-0.5 h-4 border-0",
                lastMessageStatus === "seen"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {lastMessageStatus}
            </Badge>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageItem;
