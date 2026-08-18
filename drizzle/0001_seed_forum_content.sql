INSERT INTO forum_articles (slug, category_id, status, title, deck, summary_json, body_json, reading_minutes, info_as_of, review_at, published_at, is_featured)
VALUES
('tax-credit-2026', (SELECT id FROM forum_categories WHERE slug='tax'), 'published', '2026년 소상공인이 놓치기 쉬운 세액공제 5가지', '사업 초기 비용부터 고용 관련 공제까지, 올해 확인해야 할 절세 항목을 공식 자료로 정리했습니다.', '["사업용 자산 투자와 인력 고용에는 적용 가능한 공제 제도가 있습니다.","공제마다 업종과 매출, 상시근로자 수 등 적용 조건이 다릅니다.","신고 전에 증빙과 적용 기간을 확인하고 개별 상황을 검토하세요."]', '[{"type":"heading","level":2,"text":"먼저, 내 사업이 대상인지 확인하세요"},{"type":"paragraph","text":"세액공제는 모든 사업자에게 동일하게 적용되지 않습니다. 사업 개시일, 업종, 사업장 소재지, 자산의 종류와 취득 시점에 따라 적용 여부가 달라질 수 있습니다."},{"type":"process","steps":[{"label":"업종 확인","detail":"제외 업종 여부"},{"label":"적용 기간","detail":"취득·고용 시점"},{"label":"증빙 준비","detail":"계약서·명세서"}]},{"type":"heading","level":2,"text":"신고 전에 준비할 자료"},{"type":"paragraph","text":"사업자등록증, 자산 취득 명세, 급여대장과 근로계약서 등 사실관계를 확인할 자료를 미리 분류하면 신고 과정에서 누락을 줄일 수 있습니다."},{"type":"callout","tone":"warning","title":"꼭 확인하세요","text":"세법은 개정될 수 있고 개별 사업자의 상황에 따라 적용 결과가 달라질 수 있습니다. 실제 신고 전에는 국세청 안내 또는 세무 전문가를 통해 다시 확인하세요."}]', 7, '2026-08-18', '2026-11-16', '2026-08-18T09:00:00+09:00', 1),
('policy-fund', (SELECT id FROM forum_categories WHERE slug='funding'), 'published', '소상공인 정책자금 신청 전 확인할 조건', '지원 대상, 제한 업종, 준비 서류와 신청 순서를 한눈에 확인하세요.', '["신청 공고별 대상 업종과 매출 조건을 먼저 확인하세요.","정책자금은 예산 소진 시 조기 마감될 수 있습니다.","공식 접수처와 요구 서류를 공고 원문에서 다시 확인하세요."]', '[{"type":"heading","level":2,"text":"공고 원문에서 확인할 항목"},{"type":"paragraph","text":"지원 대상, 제외 업종, 접수 기간과 요구 서류는 사업마다 다릅니다. 요약 정보만 보고 신청하기보다 반드시 공고 원문을 확인하세요."}]', 6, '2026-08-17', '2026-11-15', '2026-08-17T09:00:00+09:00', 0),
('labor-contract', (SELECT id FROM forum_categories WHERE slug='labor'), 'published', '첫 직원을 채용할 때 꼭 챙길 근로계약서', '필수 기재사항과 교부 시점, 자주 빠뜨리는 항목을 체크리스트로 안내합니다.', '["근로계약서는 근무 시작 전에 서면으로 작성하세요.","임금과 근로시간, 휴일 등 필수 항목을 빠짐없이 기재하세요.","사업주와 근로자가 각각 한 부씩 보관하세요."]', '[{"type":"heading","level":2,"text":"근무 시작 전에 작성하세요"},{"type":"paragraph","text":"근로조건을 명확히 정리하면 사업주와 근로자 모두의 분쟁 위험을 줄일 수 있습니다."}]', 5, '2026-08-16', '2026-11-14', '2026-08-16T09:00:00+09:00', 0),
('vat-review-draft', (SELECT id FROM forum_categories WHERE slug='tax'), 'review', '부가가치세 신고 전에 확인할 매입세액 항목', '공식 자료를 기준으로 작성된 관리자 검토용 초안입니다.', '["공제 가능한 매입세액인지 확인하세요.","적격 증빙을 준비하세요.","신고 기한 전에 누락 항목을 점검하세요."]', '[{"type":"heading","level":2,"text":"매입세액 공제 요건"},{"type":"paragraph","text":"사업과 직접 관련된 지출인지, 적격 증빙을 갖추었는지 확인해야 합니다."}]', 6, '2026-08-18', '2026-11-16', NULL, 0),
('funding-scheduled', (SELECT id FROM forum_categories WHERE slug='funding'), 'scheduled', '8월 마감 예정 창업 지원사업 확인법', '지역별 공고를 빠르게 찾고 마감일을 관리하는 방법입니다.', '["공식 공고 사이트를 기준으로 찾으세요.","지역과 업종 조건을 확인하세요.","마감 전에 제출 서류를 점검하세요."]', '[{"type":"heading","level":2,"text":"지역별 공고 찾기"},{"type":"paragraph","text":"중앙정부와 지자체 공식 공고에서 사업장 소재지 조건을 확인하세요."}]', 5, '2026-08-18', '2026-11-16', NULL, 0);
--> statement-breakpoint
UPDATE forum_articles SET scheduled_at='2026-08-19T09:00:00+09:00', approved_at='2026-08-18T16:20:00+09:00' WHERE slug='funding-scheduled';
--> statement-breakpoint
INSERT INTO forum_article_tags (article_id, tag_id)
SELECT a.id, t.id FROM forum_articles a JOIN forum_tags t ON
  (a.slug='tax-credit-2026' AND t.slug IN ('newly-opened','all-industries','nationwide')) OR
  (a.slug='policy-fund' AND t.slug IN ('operating','all-industries','nationwide')) OR
  (a.slug='labor-contract' AND t.slug IN ('newly-opened','restaurant','nationwide')) OR
  (a.slug='vat-review-draft' AND t.slug IN ('operating','all-industries','nationwide')) OR
  (a.slug='funding-scheduled' AND t.slug IN ('preparing','all-industries','nationwide'));
--> statement-breakpoint
INSERT INTO forum_article_sources (article_id, rule_id, url, title, publisher, kind, accessed_at, last_checked_at, sort_order)
SELECT a.id, r.id, 'https://www.nts.go.kr', '세액공제 공식 안내', '국세청', 'government', '2026-08-18', '2026-08-18', 1 FROM forum_articles a, forum_source_rules r WHERE a.slug='tax-credit-2026' AND r.domain='nts.go.kr';
--> statement-breakpoint
INSERT INTO forum_topic_suggestions (suggestion_date, rank, category_id, title, reason, score, signals_json)
VALUES
('2026-08-18', 1, (SELECT id FROM forum_categories WHERE slug='tax'), '2026년 하반기 소상공인 세액공제 변경사항', '국세청 개정 안내와 검색 관심도 상승', 95, '{"officialAnnouncements":2,"searchInterest":"rising"}'),
('2026-08-18', 2, (SELECT id FROM forum_categories WHERE slug='funding'), '8월 마감 예정 지역별 창업 지원사업', '마감이 임박한 공식 공고 7건', 88, '{"officialAnnouncements":7,"deadline":"2026-08-31"}'),
('2026-08-18', 3, (SELECT id FROM forum_categories WHERE slug='labor'), '5인 미만 사업장 휴가·휴일 실무 정리', '자영업자 반복 검색 주제', 81, '{"searchInterest":"steady"}');
--> statement-breakpoint
INSERT INTO forum_review_alerts (article_id, type, title, detail)
SELECT id, 'review_due', '재검토일 도래', '공식 출처와 적용 기준을 다시 확인하세요.' FROM forum_articles WHERE slug='policy-fund';
--> statement-breakpoint
PRAGMA optimize;
