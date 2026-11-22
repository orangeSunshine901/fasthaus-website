// Anonymous hosted forms also work when a visitor declines Analytics cookies.
export function GET(request: Request) {
  const surveyId = new URL(request.url).searchParams.get("lang") === "ar"
    ? "01a20253-2fd4-0000-e45c-68964545354d"
    : "01a20233-f15e-0000-bed3-c13124505fd2";
  return Response.redirect(`https://eu.posthogsurveys.com/external_surveys/${surveyId}`, 307);
}
