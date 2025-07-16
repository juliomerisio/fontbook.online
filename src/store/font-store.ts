import { proxy } from "valtio";
import { FontData } from "../types";

export const fontsState = proxy<FontData[]>([]);

export const state = proxy({
  loading: true,
  error: null as string | null,
});
