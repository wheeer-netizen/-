// Vercel 서버리스 함수. /api/tour.js 로 저장해서 배포하세요.
// Vercel 프로젝트 설정의 Environment Variables 에
//   이름: TOUR_SERVICE_KEY / 값: 공공데이터포털 서비스키(Decoding 키)
// 를 등록해 두면, 웹앱은 서비스키를 몰라도 이 서버가 대신 붙여서 보냅니다.

export default async function handler(req, res) {
  // 성공이든 오류든 모든 응답에 접근 허용 헤더를 붙여야 브라우저가 내용을 읽을 수 있습니다.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).json({ error: "url 파라미터가 필요합니다." });
    return;
  }

  // 공공데이터포털 주소로만 요청을 보냅니다. (다른 곳으로 서비스키가 새는 것을 막기 위함)
  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    res.status(400).json({ error: "올바른 주소가 아닙니다." });
    return;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "apis.data.go.kr") {
    res.status(400).json({ error: "허용되지 않은 주소입니다." });
    return;
  }

  const serviceKey = process.env.TOUR_SERVICE_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: "서버에 TOUR_SERVICE_KEY 환경변수가 설정되어 있지 않습니다." });
    return;
  }

  // data.go.kr 서비스키는 인코딩 없이 원문 그대로 붙입니다.
  const sep = targetUrl.includes("?") ? "&" : "?";
  const finalUrl = `${targetUrl}${sep}serviceKey=${serviceKey}`;

  try {
    const upstream = await fetch(finalUrl);
    const body = await upstream.text();
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.status(upstream.status).send(body);
  } catch {
    // 오류 내용에 서비스키가 들어 있을 수 있어 자세한 내용은 돌려주지 않습니다.
    res.status(502).json({ error: "TourAPI 호출에 실패했습니다." });
  }
}
