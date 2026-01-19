import { apiJson, apiJsonNoBody } from "@/lib/api";

const USER_PROFILE_KEY = "userProfile";

type StoredUserProfile = {
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
};

const deriveProfile = ({ email, fullName }: StoredUserProfile) => {
  const [firstName, ...rest] = (fullName || "").trim().split(" ");
  return {
    email,
    fullName,
    firstName: firstName || email?.split("@")[0] || "User",
    lastName: rest.join(" ") || "",
    name: fullName || email?.split("@")[0] || "User",
  };
};

export const signUp = async ({ email, password, firstName, lastName }: SignUpParams) => {
  const fullName = `${firstName} ${lastName}`.trim();

  await apiJsonNoBody("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, fullName, password }),
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(
      USER_PROFILE_KEY,
      JSON.stringify({ email, fullName })
    );
  }

  return true;
};

export const signIn = async ({ email, password, fullName }: signInProps & { fullName?: string }) => {
  const data = await apiJson<{ accessToken: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", data.accessToken);

    const storedRaw = localStorage.getItem(USER_PROFILE_KEY);
    const storedProfile = storedRaw ? (JSON.parse(storedRaw) as StoredUserProfile) : null;
    const profile: StoredUserProfile = {
      email,
      fullName: fullName || storedProfile?.fullName,
    };

    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  }

  return data;
};

export const logoutAccount = async () => {
  try {
    await apiJsonNoBody("/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem(USER_PROFILE_KEY);
    }
  }

  return true;
};

export const getLoggedInUser = () => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_PROFILE_KEY);
  if (!raw) return null;

  try {
    const profile = JSON.parse(raw) as StoredUserProfile;
    return deriveProfile(profile);
  } catch (error) {
    console.error("Failed to parse stored user profile:", error);
    return null;
  }
};

export const getBank = async () => {
  throw new Error("getBank is not implemented with the Spring backend yet.");
};

export const getBankByAccountId = async () => {
  throw new Error(
    "getBankByAccountId is not implemented with the Spring backend yet."
  );
};
