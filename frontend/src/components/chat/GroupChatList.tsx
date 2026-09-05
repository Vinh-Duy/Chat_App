import { useChatStore } from "@/stores/useChatStore";
import GroupChatCard from "./GroupChatCard";

const GroupChatList = () => {
  const { conversations, pinnedConversationIds, archivedConversationIds } = useChatStore();

  if (!conversations) return;

  const groupchats = conversations
    .filter((convo) => convo.type === "group" && !archivedConversationIds.includes(convo._id))
    .sort((a, b) => Number(pinnedConversationIds.includes(b._id)) - Number(pinnedConversationIds.includes(a._id)));
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {groupchats.map((convo) => (
        <GroupChatCard
          convo={convo}
          key={convo._id}
        />
      ))}
    </div>
  );
};

export default GroupChatList;
