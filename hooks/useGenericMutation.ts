import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface MutationMeta {
  method: HttpMethod;
  url: string | ((variables: any) => string);
  queryKey: readonly string[];
  onSuccessMessage?: string;
  onErrorMessage?: string;
  transformVariables?: (variables: any) => any;
  transformResponse?: (response: AxiosResponse<any>) => any;
  optimisticUpdate?: (oldData: any, variables: any) => any;
}

interface MutationContext {
  previousData: unknown;
}

export function useGenericMutation<
  TData = unknown,
  TVariables = unknown,
  TError = Error,
>({
  meta,
  onSuccess,
  onError,
}: {
  meta: MutationMeta;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (
    error: TError,
    variables: TVariables,
    context: MutationContext | undefined,
  ) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables, MutationContext>({
    mutationFn: async (variables: TVariables) => {
      const finalUrl =
        typeof meta.url === "function" ? meta.url(variables) : meta.url;
      const transformedVariables = meta.transformVariables
        ? meta.transformVariables(variables)
        : variables;

      const response = await axios({
        method: meta.method,
        url: finalUrl,
        ...(meta.method !== "GET" && { data: transformedVariables }),
      });

      return meta.transformResponse
        ? meta.transformResponse(response)
        : response.data;
    },

    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey: meta.queryKey });
      const previousData = queryClient.getQueryData(meta.queryKey);

      if (meta.optimisticUpdate) {
        queryClient.setQueryData(meta.queryKey, (old: any) =>
          meta.optimisticUpdate!(old, variables),
        );
      }

      return { previousData };
    },

    onSuccess: (data: TData, variables: TVariables) => {
      if (meta.onSuccessMessage) {
        toast.success(meta.onSuccessMessage);
      }
      onSuccess?.(data, variables);
    },

    onError: (
      error: TError,
      variables: TVariables,
      context: MutationContext | undefined,
    ) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(meta.queryKey, context.previousData);
      }

      if (meta.onErrorMessage) {
        toast.error(meta.onErrorMessage);
      } else {
        toast.error(`Operation failed: ${(error as AxiosError).message}`);
      }

      onError?.(error, variables, context);
    },
  });
}
