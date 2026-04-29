import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as IDB from 'idb-keyval';
import { useCallback, useEffect, useState } from 'react';

export const useSplitPanelStoredSizes = (
  storageKey?: string,
): [number[] | undefined, (newSizes: number[]) => void] => {
  const enabled = !!storageKey;
  const queryClient = useQueryClient();
  const [sizes, setSizesState] = useState<number[] | undefined>();

  const { data: dbSizes, isSuccess } = useQuery(
    [storageKey],
    async () => IDB.get<number[]>(storageKey!),
    { enabled, staleTime: Infinity },
  );

  useEffect(() => {
    if (isSuccess && Array.isArray(dbSizes)) {
      setSizesState(dbSizes);
    }
  }, [dbSizes, isSuccess]);

  const { mutate } = useMutation({
    mutationFn: async (sizesToStore: number[]) => {
      if (!enabled) return;
      return IDB.set(storageKey!, sizesToStore);
    },
    onSuccess: (_, variables) => {
      if (!enabled) return;
      queryClient.setQueryData([storageKey], variables);
    },
  });

  const setSizes = useCallback(
    (newSizes: number[]): void => {
      setSizesState(newSizes);
      mutate(newSizes);
    },
    [mutate],
  );

  return [sizes, setSizes];
};
