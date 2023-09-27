import { ProfileDTO } from "../../../backend/src/profile/models/profile.dto";

export interface ProfileContextData {
  profile: ProfileDTO | null;
  avatarImageUrl: string | undefined;
  refreshProfileContext: () => void;
  createProfile: (nickname: string) => Promise<void>;
  updateProfile: (profile: Partial<ProfileDTO>) => Promise<void>;
  uploadAvatarImage: (formData: FormData) => Promise<void>;
  deleteAccount: () => Promise<void>;
}