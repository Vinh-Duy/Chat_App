import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const {
    conversations,
    activeConversationId,
    messageSearchQuery,
    setMessageSearchQuery,
  } = useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers, typingUsers } = useSocketStore();

  let otherUser;

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  if (!chat) {
    return (
      <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }

  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;

    if (!user || !otherUser) return;
  }

  return (
    <header className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />

        <div className="p-2 w-full flex items-center gap-3">
          {/* avatar */}
          <div className="relative">
            {chat.type === "direct" ? (
              <>
                <UserAvatar
                  type={"sidebar"}
                  name={otherUser?.displayName || "ChatsApp"}
                  avatarUrl={otherUser?.avatarUrl || undefined}
                />
                <StatusBadge
                  status={
                    onlineUsers.includes(otherUser?._id ?? "") ? "online" : "offline"
                  }
                />
              </>
            ) : (
              <GroupChatAvatar
                participants={chat.participants}
                type="sidebar"
              />
            )}
          </div>

          {/* name */}
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-foreground">
              {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
            </h2>
            {(typingUsers[chat._id]?.length ?? 0) > 0 && (
              <p className="text-xs text-primary animate-pulse">Đang nhập...</p>
            )}
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <Search className="size-4 text-muted-foreground" />
            <Input
              aria-label="Search messages"
              value={messageSearchQuery}
              onChange={(event) => setMessageSearchQuery(event.target.value)}
              placeholder="Search"
              className="h-8 w-28 border-0 bg-muted/50 text-xs focus-visible:ring-1"
            />
            {messageSearchQuery && (
              <button
                type="button"
                aria-label="Clear message search"
                onClick={() => setMessageSearchQuery("")}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;
