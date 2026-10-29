import { purgeRegistrationsBefore } from "../db";
import { addMonths, nowLocal } from "./dates";

/** Registrations are kept this long after their event ends (privacy policy, Loi 25). */
export const RETENTION_MONTHS = 12;

export async function purgeExpiredRegistrations(env: Env, now = nowLocal()): Promise<number> {
  return purgeRegistrationsBefore(env.DB, addMonths(now, -RETENTION_MONTHS));
}
