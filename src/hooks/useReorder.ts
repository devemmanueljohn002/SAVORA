import { useMutation } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import type { Order } from "@/types";

export function useReorderCheck() {
  return useMutation({
    mutationFn: (orderId: string) => orderService.checkReorderEligibility(orderId),
  });
}

/**
 * Populates the cart from a past order's line items. Call only after
 * useReorderCheck confirms `canReorder` — this does not re-validate
 * availability itself, since prices/options may have changed since the
 * eligibility check response was read.
 */
export function applyReorderToCart(order: Order) {
  const { replaceVendorCart, addItem } = useCartStore.getState();
  replaceVendorCart(order.vendorId, order.vendorName);
  for (const item of order.items) {
    addItem({
      productId: item.productId,
      vendorId: item.vendorId,
      vendorName: order.vendorName,
      productName: item.productName,
      imageUrl: item.imageUrl,
      basePrice: item.unitPrice - item.selectedOptions.reduce((sum, o) => sum + o.priceDelta, 0),
      quantity: item.quantity,
      selectedOptions: item.selectedOptions,
      notes: item.notes,
    });
  }
}
