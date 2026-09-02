import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressService, type AddressPayload } from "@/services/addressService";

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.list(),
  });
}

export function useAddressMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const create = useMutation({
    mutationFn: (payload: AddressPayload) => addressService.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AddressPayload> }) => addressService.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
