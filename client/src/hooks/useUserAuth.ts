import { trpc } from "@/lib/trpc";

export function useUserAuth() {
  const { data: user, isLoading } = trpc.userAuth.me.useQuery();
  const logoutMutation = trpc.userAuth.logout.useMutation({
    onSuccess: () => {
      // Clear cookie and reload page
      document.cookie = "user_session=; path=/; max-age=0";
      window.location.href = "/";
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const getLoginUrl = () => "/user/login";

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    getLoginUrl,
  };
}
