import "server-only";
import { getProperties } from "./api";
import { scanTours } from "./tours";
export const getTours = (page: number, area: string, district: string) => scanTours(getProperties, page, area, district);
