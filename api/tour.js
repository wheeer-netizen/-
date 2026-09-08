// Vercel 서버리스 함수 예시. 이 파일을 프로젝트의 /api/tour.js 로 저장하고
// Vercel에 배포하면 https://내프로젝트.vercel.app/api/tour 가 프록시 주소가 됩니다.
// 그 주소를 앱의 "프록시 서버 주소" 칸에 넣어주세요.

export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).json({ error: "url 파라미터가 필요합니다." });
    return;
  }

  try {
    const upstream = await fetch(targetUrl);
    const body = await upstream.text();

    // 브라우저의 교차 출처 요청을 허용
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({ error: "TourAPI 호출에 실패했습니다.", detail: String(err) });
  }
}
