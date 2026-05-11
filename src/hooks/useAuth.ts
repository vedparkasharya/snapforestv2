import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: mongoUser,
    isLoading: mongoLoading,
  } = trpc.mongoAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Also check legacy auth as fallback
  const {
    data: kimiUser,
    isLoading: kimiLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !mongoUser,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const logout = useCallback(() => {
    localStorage.removeItem("snapforest_token");
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  const user = mongoUser || kimiUser || null;
  const isLoading = mongoLoading || (kimiLoading && !mongoUser);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: isLoading || logoutMutation.isPending,
      logout,
    }),
    [user, isLoading, logoutMutation.isPending, logout],
  );
}
