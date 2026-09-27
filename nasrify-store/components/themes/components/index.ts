import React from "react";

// Basic (12)
export * from "./Divider";
export * from "./Spacer";
export * from "./IconBox";
export * from "./ImageBox";
export * from "./AlertBox";
export * from "./ProgressBar";
export * from "./Counter";
export * from "./Tabs";
export * from "./Accordion";
export * from "./IconList";
export * from "./SocialIcons";
export * from "./CustomHTML";

// E-commerce (10)
export * from "./AddToCartBtn";
export * from "./BuyNowBtn";
export * from "./QuantitySelector";
export * from "./VariantSelector";
export * from "./WishlistBtn";
export * from "./CompareBtn";
export * from "./ProductPrice";
export * from "./CountdownTimer";
export * from "./RatingInput";
export * from "./ShareButtons";

// Forms (5)
export * from "./FormField";
export * from "./TextareaField";
export * from "./CheckboxRadio";
export * from "./SelectDropdown";
export * from "./SubmitButton";

// Media (5)
export * from "./VideoPlayer";
export * from "./AudioPlayer";
export * from "./GalleryGrid";
export * from "./Slideshow";
export * from "./LightboxImage";

import { Divider } from "./Divider";
import { Spacer } from "./Spacer";
import { IconBox } from "./IconBox";
import { ImageBox } from "./ImageBox";
import { AlertBox } from "./AlertBox";
import { ProgressBar } from "./ProgressBar";
import { Counter } from "./Counter";
import { Tabs } from "./Tabs";
import { Accordion } from "./Accordion";
import { IconList } from "./IconList";
import { SocialIcons } from "./SocialIcons";
import { CustomHTML } from "./CustomHTML";

import { AddToCartBtn } from "./AddToCartBtn";
import { BuyNowBtn } from "./BuyNowBtn";
import { QuantitySelector } from "./QuantitySelector";
import { VariantSelector } from "./VariantSelector";
import { WishlistBtn } from "./WishlistBtn";
import { CompareBtn } from "./CompareBtn";
import { ProductPrice } from "./ProductPrice";
import { CountdownTimer } from "./CountdownTimer";
import { RatingInput } from "./RatingInput";
import { ShareButtons } from "./ShareButtons";

import { FormField } from "./FormField";
import { TextareaField } from "./TextareaField";
import { CheckboxRadio } from "./CheckboxRadio";
import { SelectDropdown } from "./SelectDropdown";
import { SubmitButton } from "./SubmitButton";

import { VideoPlayer } from "./VideoPlayer";
import { AudioPlayer } from "./AudioPlayer";
import { GalleryGrid } from "./GalleryGrid";
import { Slideshow } from "./Slideshow";
import { LightboxImage } from "./LightboxImage";

export const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  divider: Divider,
  spacer: Spacer,
  icon_box: IconBox,
  image_box: ImageBox,
  alert_box: AlertBox,
  progress_bar: ProgressBar,
  counter: Counter,
  tabs: Tabs,
  accordion: Accordion,
  icon_list: IconList,
  social_icons: SocialIcons,
  custom_html: CustomHTML,

  add_to_cart_btn: AddToCartBtn,
  buy_now_btn: BuyNowBtn,
  quantity_selector: QuantitySelector,
  variant_selector: VariantSelector,
  wishlist_button: WishlistBtn,
  compare_button: CompareBtn,
  product_price: ProductPrice,
  countdown_timer: CountdownTimer,
  rating_input: RatingInput,
  share_buttons: ShareButtons,

  form_field: FormField,
  textarea_field: TextareaField,
  checkbox_radio: CheckboxRadio,
  select_dropdown: SelectDropdown,
  submit_button: SubmitButton,

  video_player: VideoPlayer,
  audio_player: AudioPlayer,
  gallery_grid: GalleryGrid,
  slideshow: Slideshow,
  lightbox_image: LightboxImage,
};

export function renderComponent(type: string, props: any): React.ReactNode {
  const Component = COMPONENT_MAP[type];
  if (!Component) return null;
  return React.createElement(Component, props);
}
