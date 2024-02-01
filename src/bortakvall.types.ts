export interface GodisResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  stock_status: string;
  images: {
    thumbnail: string;
    large: string;
  };
}

export interface GodisPost {
  product_id: number;
  qty: number;
  item_price: number;
  item_total: number;
}

export interface formDataTyp {
  customer_first_name: string;
  customer_last_name: string;
  customer_address: string;
  customer_postcode: number | string;
  customer_city: string;
  customer_email: string;
  customer_phone: number | string;
  order_total: number;
  order_items: GodisPost[];
}
export interface FetchDataResponse {
  data: GodisResponse[];
}
