export interface WhatsAppOrderSettings {
  phoneNumber: string;
  enableFloating: boolean;
  enableProductButton: boolean;
  floatingMessage: string;
  productMessage: string;
  buttonText: string;
}

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppOrderSettings = {
  phoneNumber: "",
  enableFloating: true,
  enableProductButton: true,
  floatingMessage: "Hello! I am browsing your store and have a question.",
  productMessage: "Hello! I would like to order: {product_name} ({product_url}).",
  buttonText: "Order on WhatsApp",
};
