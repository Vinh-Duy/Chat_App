import { Heart } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";

type EditableField = {
  key: keyof Pick<User, "displayName" | "username" | "email" | "phone">;
  label: string;
  type?: string;
};

const PERSONAL_FIELDS: EditableField[] = [
  { key: "displayName", label: "Tên hiển thị" },
  { key: "username", label: "Tên người dùng" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Số điện thoại" },
];

type Props = {
  userInfo: User | null;
};

const PersonalInfoForm = ({ userInfo }: Props) => {
  const updateProfile = useUserStore((state) => state.updateProfile);
  const [form, setForm] = useState(() => userInfo);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(userInfo);
  }, [userInfo]);

  if (!userInfo || !form) return null;

  const updateField = (key: keyof User, value: string) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await updateProfile({
        displayName: form.displayName,
        username: form.username,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
      });

      if (updatedUser) {
        setForm(updatedUser);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-strong border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="size-5 text-primary" />
          Thông tin cá nhân
        </CardTitle>
        <CardDescription>
          Cập nhật chi tiết cá nhân và thông tin hồ sơ của bạn
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSONAL_FIELDS.map(({ key, label, type }) => (
            <div
              key={key}
              className="space-y-2"
            >
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={type ?? "text"}
                value={form[key] ?? ""}
                onChange={(event) => updateField(key, event.target.value)}
                className="glass-light border-border/30"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Giới thiệu</Label>
          <Textarea
            id="bio"
            rows={3}
            value={form.bio ?? ""}
            onChange={(event) => updateField("bio", event.target.value)}
            className="glass-light border-border/30 resize-none"
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full md:w-auto bg-gradient-primary hover:opacity-90 transition-opacity">
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;
