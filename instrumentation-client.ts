import posthog from "posthog-js";
import { posthogConfig } from "./lib/analytics/posthog-config";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) posthog.init(token, posthogConfig());
