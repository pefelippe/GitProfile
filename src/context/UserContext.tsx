import { createContext, ReactNode } from "react";
import { getUserData, UserData } from "../api/requests/getUserData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface UserContextType {
  data: UserData | undefined;
  isPending: boolean;
  isError: boolean;
  error: AxiosError;
  mutate: (username: string) => void;
}

interface UserProviderProps {
  children: ReactNode;
}

export const UserContext = createContext({} as UserContextType);

export function UserProvider({ children }: UserProviderProps) {
  const queryClient = useQueryClient();

  // Use `useMutation` hook to handle API mutations
  const mutation = useMutation<UserData, unknown, string>({
    mutationFn: (username: string) => getUserData({ username }),
    // Update the query cache on successful mutation
    onSuccess: (data, username) => {
      queryClient.setQueryData(["userData", username], data);
    },
  });

  const { isPending, isError, data, mutate, error } = mutation;

  // Type-cast the error to AxiosError
  const axiosError = error as AxiosError;

  const contextValue: UserContextType = {
    isPending,
    isError,
    data,
    error: axiosError,
    mutate,
  };

  // Provide the UserContext to the children components
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
