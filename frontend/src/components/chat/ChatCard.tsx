import { Card } from "@/components/ui/card";
import { formatChatListTime, cn } from "@/lib/utils";
import { Archive, BellOff, MoreHorizontal, Pin } from "lucide-react";
import { Button } from "../ui/button";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subtitle: React.ReactNode;
  isPinned?: boolean;
  isMuted?: boolean;
  onTogglePin?: () => void;
  onToggleMute?: () => void;
  onToggleArchive?: () => void;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subtitle,
  isPinned = false,
  isMuted = false,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
}: ChatCardProps) => {
  return (
    <Card
      key={convoId}
      className={cn(
        "border-none p-3 cursor-pointer transition-smooth glass hover:bg-muted/30",
        isActive &&
          "ring-2 ring-primary/50 bg-gradient-to-tr from-primary-glow/10 to-primary-foreground"
      )}
      onClick={() => onSelect(convoId)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">{leftSection}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                "font-semibold text-sm truncate",
                unreadCount && unreadCount > 0 && "text-foreground"
              )}
            >
              {name}
            </h3>

            <span className="text-xs text-muted-foreground">
              {timestamp ? formatChatListTime(timestamp) : ""}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">{subtitle}</div>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {isPinned && <Pin className="size-3 text-primary" />}
              {isMuted && <BellOff className="size-3 text-muted-foreground" />}
              <div className="group/menu relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  aria-label="Conversation options"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
                <div className="pointer-events-none absolute right-0 top-7 z-20 w-32 rounded-md border bg-background p-1 opacity-0 shadow-lg group-focus-within/menu:pointer-events-auto group-focus-within/menu:opacity-100">
                  <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted" onClick={onTogglePin}>
                    <Pin className="size-3" /> {isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted" onClick={onToggleMute}>
                    <BellOff className="size-3" /> {isMuted ? "Unmute" : "Mute"}
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted" onClick={onToggleArchive}>
                    <Archive className="size-3" /> Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;
