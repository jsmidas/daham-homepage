# 카테고리 슬롯 기반 구독 — 데이터 흐름

## 개요
고객은 카테고리별 "슬롯 수"만 정해두면 매 배송 자동으로 메뉴가 채워지고, 배송 2~3일 전 미리보기 화면에서 교체/건너뛰기가 가능하다.

```
[구독 시작]
  슬롯 설정 화면  ──▶  Subscription.slots 저장  ──▶  첫 배송 Selection 자동 생성

[매주 반복]
  배송일 D-3 미리보기  ──▶  Selection 로드 (없으면 생성)
                        ├─ 교체  → Selection.productId 변경
                        ├─ 건너뛰기 → Period.status=SKIPPED, Selection 비움
                        └─ 확정 → (기존 빌링 플로우로 연결)
```

---

## 데이터 모델

### Subscription.slots (신규 필드, JSON)

```json
{
  "salad":   2,
  "simple":  1,
  "banchan": 0,
  "drink":   1
}
```

- key = `Category.slug` (고정, 카테고리 CRUD로 slug가 바뀌면 마이그레이션 필요)
- value = 배송 1회당 수량 (0 허용)
- 본품(`isOption=false`) 합 × `평균가` ≥ `minOrderAmount` 가 되어야 구독 생성 가능
- `Subscription.itemsPerDelivery` 는 슬롯 합으로 자동 계산

### SubscriptionSelection (기존 재사용)
- 자동 배정 결과가 여기 저장됨. `(periodId, deliveryDate, productId, quantity)`
- 슬롯 개념은 **Selection 레코드의 개수**로 표현 (1슬롯 = 1 row)
- 고객이 교체해도 같은 row의 `productId`만 바뀜 → 히스토리가 필요하면 별도 로그 테이블 추가 (추후)

### 활용하지 않는 것
- `SubscriptionItem` — 요일별 고정 상품 구조는 슬롯과 충돌. 레거시로 유지만.
- `planType`, `frequency` — 이미 deprecated 처리됨

---

## 자동 배정 알고리즘

입력: `subscription`, `deliveryDate`, `menuPool` (해당 날짜의 `MenuAssignment[]`)

```
for each (categorySlug, count) in subscription.slots:
  pool = menuPool.filter(p => p.category.slug === categorySlug)
  if pool is empty: continue  // 빈 슬롯으로 남김 (미리보기에서 경고)

  // 최근 2주 내 이미 배송된 productId 조회 (SubscriptionSelection 기반)
  recent = selections.where(
    subscriptionId = current,
    deliveryDate >= today - 14d,
    deliveryDate <= today
  ).map(s => s.productId)

  fresh = pool.filter(p => !recent.includes(p.id))
  chosen = fresh.length >= count ? fresh : pool  // 2주 제외가 부족하면 전체에서 뽑음

  // 정렬: 재고 많은 것 우선, 동률시 sortOrder
  chosen.sort(by stock desc, sortOrder asc)

  take first `count` items → create Selection rows
```

**엣지 케이스**
- 풀에 슬롯 수만큼 없음 → 가능한 만큼만 채우고 미리보기에서 "이번엔 선택지 부족" 카드 노출
- 옵션 카테고리(isOption=true)는 최소 주문액 검증에서 제외되지만 배정 로직은 동일

---

## 화면-데이터 매핑

### 화면 1: 슬롯 설정 `/subscribe/slot`

| UI 요소 | 데이터 소스 |
|---|---|
| 프리셋 버튼 (가벼운/균형/든든/직접) | 클라이언트 상수 |
| 카테고리별 스테퍼 | `GET /api/categories` (sortOrder 순) |
| 카테고리별 가격 범위 | `GET /api/products?category=salad` aggregate min/max |
| sticky 본품 합계 | 클라이언트 계산 (카테고리 평균가 × 슬롯) |
| 최소 주문액 | `GET /api/settings/public` → `minOrderAmount` |
| 저장 | `POST /api/subscribe/slot` |

**POST /api/subscribe/slot** 요청/응답
```ts
req  { slots: Record<slug, number> }
res  { subscriptionId, firstPeriodId, nextDeliveryDate }
```

서버 처리:
1. 본품 합계 × 개수 ≥ minOrderAmount 재검증
2. `Subscription.create({ slots, itemsPerDelivery: sum, status: PENDING })`
3. 다음 배송일 계산 (`DeliveryCalendar` 에서 오늘 이후 가장 이른 `isActive=true`)
4. 자동 배정 유틸 호출 → `SubscriptionPeriod` + `SubscriptionSelection` 생성
5. 빌링키 발급은 별도 플로우 (이후 화면 2에서 "확정" 누르면 기존 빌링 흐름으로)

### 화면 2: 배송 미리보기 `/subscribe/next`

| UI 요소 | 데이터 소스 |
|---|---|
| 배송일 + 마감 타이머 | `Subscription.nextDeliveryDate` |
| sticky 본품/최소액 바 | 서버 응답 `baseTotal`, `minOrderAmount` |
| 슬롯 카드 | `SubscriptionSelection` + `Product` join |
| 0슬롯 카테고리 "이번엔 빼셨어요" | `Subscription.slots[slug] === 0` |
| 바꾸기 모달 후보 | `GET /api/delivery-calendar` 에서 해당 날짜의 같은 카테고리 풀 |
| 최근 먹은 것 표시 | 최근 14일 Selection 기준 |

**API**
```
GET   /api/subscribe/next          → { subscription, period, selections, pool, baseTotal, minOrderAmount }
PATCH /api/subscribe/next/selection → { selectionId, newProductId } (바꾸기)
POST  /api/subscribe/next/skip     → 이번 주 건너뛰기
POST  /api/subscribe/next/confirm  → 확정 (기존 /api/subscribe/billing 재사용)
```

---

## 마이그레이션 영향
- `schema.prisma` 에 `slots Json?` 필드만 추가 → `prisma db push` 로 반영 (기존 row는 null 허용)
- 기존 `/subscribe` 페이지는 **그대로 유지**. 새 플로우는 `/subscribe/slot` 으로 진입.
- 홈에서 "정기구독 시작" 버튼을 새 경로로 점진 전환하면 A/B 가능.
