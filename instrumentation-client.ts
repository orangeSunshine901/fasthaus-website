import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    defaults: "2025-05-24",
    opt_out_capturing_by_default: true,
    opt_out_persistence_by_default: true,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: false,
    mask_all_text: true,
    mask_all_element_attributes: true,
    session_recording: { maskAllInputs: true },
  });
}
