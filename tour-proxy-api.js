// Vercel 서버리스 함수. /api/tour.js 로 저장해서 배포하세요.
// 배포 후 Vercel 프로젝트 설정 > Environment Variables 에서
// 이름: TOUR_SERVICE_KEY, 값: 공공데이터포털에서 받은 서비스키(Decoding 키)를 등록하고
// 다시 배포(Redeploy)하면 적용됩니다.
//
// 클라이언트(웹앱)는 서비스키를 전혀 몰라도 됩니다 - 이 서버가 대신 붙여서 보냅니다.

export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).json({ error: "url 파라미터가 필요합니다." });
    return;
  }

  const serviceKey = process.env.TOUR_SERVICE_KEY;
  if (!serviceKey) {
    res.status(500).json({ error: "서버에 TOUR_SERVICE_KEY 환경변수가 설정되어 있지 않습니다." });
    return;
  }

  // 주의: data.go.kr의 서비스키는 URL에 인코딩 없이 원문 그대로 붙여야 정상 인식됩니다.
  const sep = targetUrl.includes("?") ? "&" : "?";
  const finalUrl = `${targetUrl}${sep}serviceKey=${serviceKey}`;

  try {
    const upstream = await fetch(finalUrl);
    const body = await upstream.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({ error: "TourAPI 호출에 실패했습니다.", detail: String(err) });
  }
}
