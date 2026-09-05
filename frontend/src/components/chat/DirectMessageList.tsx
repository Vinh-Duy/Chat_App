import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";

const DirectMessageList = () => {
  const { conversations, pinnedConversationIds, archivedConversationIds } = useChatStore();

  if (!conversations) return;

  const directConversations = conversations
    .filter((convo) => convo.type === "direct" && !archivedConversationIds.includes(convo._id))
    .sort((a, b) => Number(pinnedConversationIds.includes(b._id)) - Number(pinnedConversationIds.includes(a._id)));

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversations.map((convo) => (
        <DirectMessageCard
          convo={convo}
          key={convo._id}
        />
      ))}
    </div>
  );
};

export default DirectMessageList;
