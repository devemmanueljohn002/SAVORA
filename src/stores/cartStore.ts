import { create } from "zustand";
import type { CartLineItem, CartSelectedOption } from "@/types";

interface AddItemInput {
  productId: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  imageUrl?: string;
  basePrice: number;
  quantity: number;
  selectedOptions?: CartSelectedOption[];
  notes?: string;
}

interface CartState {
  vendorId: string | null;
  vendorName: string | null;
  items: CartLineItem[];

  /** Throws if attempting to add an item from a different vendor than what's already in the cart. */
  addItem: (input: AddItemInput) => { ok: true } | { ok: false; reason: "VENDOR_CONFLICT" };
  removeItem: (lineId: string) => void;
  incrementItem: (lineId: string) => void;
  decrementItem: (lineId: string) => void;
  clear: () => void;
  replaceVendorCart: (vendorId: string, vendorName: string) => void;

  subtotal: () => number;
  itemCount: () => number;
}

function lineItemKey(productId: string, selectedOptions: CartSelectedOption[]): string {
  const optionsKey = selectedOptions
    .map((o) => o.choiceId)
    .sort()
    .join(",");
  return `${productId}::${optionsKey}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  vendorId: null,
  vendorName: null,
  items: [],

  addItem: (input) => {
    const state = get();

    // Spec section 17: prevent mixing products from incompatible vendors
    // unless the backend explicitly supports multi-vendor carts (it doesn't yet).
    if (state.vendorId && state.vendorId !== input.vendorId && state.items.length > 0) {
      return { ok: false, reason: "VENDOR_CONFLICT" };
    }

    const selectedOptions = input.selectedOptions ?? [];
    const optionsTotal = selectedOptions.reduce((sum, o) => sum + o.priceDelta, 0);
    const unitPrice = input.basePrice + optionsTotal;
    const key = lineItemKey(input.productId, selectedOptions);
    const existingLine = state.items.find((item) => lineItemKey(item.productId, item.selectedOptions) === key);

    set((prev) => {
      if (existingLine) {
        return {
          vendorId: input.vendorId,
          vendorName: input.vendorName,
          items: prev.items.map((item) =>
            item.id === existingLine.id ? { ...item, quantity: item.quantity + input.quantity } : item
          ),
        };
      }

      const newLine: CartLineItem = {
        id: `${key}::${Date.now()}`,
        productId: input.productId,
        vendorId: input.vendorId,
        productName: input.productName,
        imageUrl: input.imageUrl,
        unitPrice,
        quantity: input.quantity,
        selectedOptions,
        notes: input.notes,
      };

      return {
        vendorId: input.vendorId,
        vendorName: input.vendorName,
        items: [...prev.items, newLine],
      };
    });

    return { ok: true };
  },

  removeItem: (lineId) => set((state) => ({ items: state.items.filter((item) => item.id !== lineId) })),

  incrementItem: (lineId) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === lineId ? { ...item, quantity: item.quantity + 1 } : item)),
    })),

  decrementItem: (lineId) =>
    set((state) => ({
      items: state.items
        .map((item) => (item.id === lineId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    })),

  clear: () => set({ vendorId: null, vendorName: null, items: [] }),

  replaceVendorCart: (vendorId, vendorName) => set({ vendorId, vendorName, items: [] }),

  subtotal: () => get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
