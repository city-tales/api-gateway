import { z } from "../config/imports.js";

export const UpdatePasswordForEmailHTTPRequest = z.object({
    password: z.string(),
});