import api from "@/lib/axios";

export const friendService = {
  async searchByUsername(username: string) {
    const res = await api.get("/users/search", { params: { username } });
    return res.data.user;
  },

  async sendFriendRequest(to: string, message?: string) {
    const res = await api.post("/friends/requests", { to, message });
    return res.data.message;
  },

  async getAllFriendRequest() {
    try {
      const res = await api.get("/friends/requests");
      const { sent, received } = res.data;
      return { sent, received };
    } catch (error) {
      console.error("Lỗi khi gửi getAllFriendRequest", error);
    }
  },

  async acceptRequest(requestId: string) {
    const res = await api.post(`/friends/requests/${requestId}/accept`);
    return res.data.newFriend;
  },

  async declineRequest(requestId: string) {
    await api.post(`/friends/requests/${requestId}/decline`);
  },

  async getFriendList() {
    const res = await api.get("/friends");
    return res.data.friends;
  },
};
